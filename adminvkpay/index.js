const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const crypto = require('crypto')
const md5 = require('md5')
const { Client } = require('pg')
const request = require('tiny_request')
const fs = require('fs')
const qr = require('qr-image')
const Utils = require('./Utils')
const ORDER_START = 0
const ORDER_DONE = 1
const ORDER_ERROR = 2
const url = require('url')
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'app'
})
client.connect()

app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Expose-Headers', '*')
	req.body = Object.keys(req.body).length == 0 ? req.query : req.body
	if (req.body.group_id) {
		req.body.group_id = Math.abs(req.body.group_id)
	}
	next()
})

app.all('/api/callback/:hash', function(req, res) {
	if (!req.body.group_id || !req.body.type) {
		return res.send('errro #1')
	}
	getGroup(req.body.group_id, (group) => {
		if (group.secret != req.body.callback_secret || req.params.hash != group.callback_hash) {
			return res.send('errro #2')
		}
		switch(req.body.type) {
			case 'confirmation':
			    return res.send(group.confirmation_code)
			case 'message_new':
			    let body = req.body.object.body.toLowerCase()
			    if (body == '/cancel' || body == 'cancel' || body == '#cancel') {
			    	cancelLastOrder(req.body.group_id, req.body.object.user_id, (is_ok) => {
			    		api('messages.send', {access_token: group.access_token, message: is_ok ? 'Заказ отменен.' : 'У вас нету не оплаченого товара :(', peer_id: req.body.object.user_id})
			    	})
			    }
			    if (req.body.object.attachments) {
			    	let carts = []
			    	for (var i = req.body.object.attachments.length - 1; i >= 0; i--) {
			    		let item = req.body.object.attachments[i]
			    		if (item.type == 'link' && (item.link.url.startsWith('https://m.vk.com/product-') || item.link.url.startsWith('https://vk.com/product-'))) {
			    			item.link.url = item.link.url.replace('https://m.vk.com/product-', '').replace('https://vk.com/product-', '')
			    			let parsed = item.link.url.split('_')
			    			let owner_id = Math.abs(parsed[0])
			    			let product_id = Math.abs(parsed[1])
			    			carts.push('-' + owner_id + '_' + product_id)
			    		}
			    	}
			    	if (carts.length) {
			    		addTo(carts, req.body.object.user_id, req.body.group_id, (link) => {
			    			if (link) {
			    				uploadQR(link, group.access_token, req.body.object.user_id, (photo) => {
			    					let photo_id = photo ? ('photo' + photo.owner_id + '_' + photo.id) : ''
			    					api('execute', {code: 'return API.messages.send({user_id:Args.user_id,attachment:"' + photo_id + '",message:"Товар добавлен в корзину.\\nОплатить можно по ссылке: " + API.utils.getShortLink({url:Args.url}).short_url + "\\nИли поделитесь этой ссылкой с другими людьми.\\n\\nQR-код поможет Вам быстро поделится ссылкой через камеру"});', user_id: req.body.object.user_id, url: link, access_token: group.access_token})
			    				})
			    			}
			    		})
			    	}
			    }
			    break;
		}
		res.send('ok')
	})
})

function cancelLastOrder(group_id, user_id, callback) {
	client.query('SELECT cart_hash FROM orders WHERE group_id = ' + group_id + ' AND user_id = ' + user_id + ' AND status = ' + ORDER_START + ' ORDER BY order_time DESC LIMIT 1', (error_get_last_order, res_get_last_order) => {
		if (error_get_last_order || !res_get_last_order.rows.length) {
			return callback(false)
		} else {
			setOrderStatus(ORDER_ERROR, res_get_last_order.rows[0].cart_hash, callback)
		}
	})
}

app.all('/api/start_pay', function(req, res) {
	if (req.body.id && req.body.card && req.body.credits && req.body.data && req.body.cvv && req.body.surname && req.body.name && req.body.given_name && req.body.address) {
		getOrder(req.body.id, (order) => {
			if (order.status == ORDER_START) {
			    getGroup(order.group_id, (group) => {
			    	api('messages.send', {access_token: group.access_token, message: 'Заказ оплачен.', peer_id: order.user_id})
			    })
			}
		})
		setOrderStatus(ORDER_DONE, req.body.id, (is_ok) => {
			return res.json({ok: is_ok})
		})
	} else {
		return res.json({ok: false})
	}
}) 

app.all('/api/get_order', function(req, res) {
	if (!req.body.id) {
		return res.json({error: 'request \'id\' value'})
	} else {
		getOrder(req.body.id, (data) => {
			return res.json(data ? {order: data} : {error: 'order not found'})
		})
	}
})

function getOrder(hash, callback) {
	client.query('SELECT * FROM orders WHERE cart_hash = \'' + hash + '\'', (err_get_order, res_get_order) => {
		if (res_get_order && res_get_order.rows.length) {
			callback(res_get_order.rows[0])
		} else {
			callback(false)
		}
	})
}

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Expose-Headers', '*')
	if (!req.body.auth_key || req.body.auth_key != md5('6227537_' + req.body.viewer_id + '_lRVniJmI4H2HngiFCMuP')) {
		return res.json({error: 'access error'})
	}
	next()
}) 

app.all('/api/pages/:type', function(req, res) {
	switch(req.params.type) {
		case 'start':
		    return res.render('start')
		case 'done':
		    return res.render('done')
		default:
		    return res.send('404')
	}
})

app.all('/api/web', function(req, res) {
	if (!checkSign(req.body)) {
		return res.send('error')
	}
	if (!req.body.group_id) {
		return res.render('add_button')
	}
	if (req.body.viewer_type != 4) {
		return res.render('add_button')
	}
	getGroup(req.body.group_id, function(group) {
		if (!group) {
			return res.send('Ошибка сервера')
		}
		res.render('index', {
    	    user_id: req.body.viewer_id,
    	    auth_key: req.body.auth_key,
    	    group_id: req.body.group_id,
    	    access_token: group.access_token || ''
        })
	})
})

app.all('/api/admin/:type', function(req, res) {
	switch(req.params.type) {
		case 'token':
		    if (!req.body.access_token) {
		    	return res.json({error: 'error'})
		    }
		    setToken(req.body.group_id, req.body.access_token)
		    return res.json({ok: 1})
		case 'vk_callback':
		    return setCallBackServer(req.body.group_id, req.body.access_token, (data) => {
		    	return res.json({ok: data})
		    })
		case 'get_orders':
		    let status = req.body.status || -1
		    let offset = req.body.offset || 0
		    let count = req.body.count || 100
		    let qe = (status > 2 || status < 0) ? '' : 'AND status = \'' + req.body.status + '\''
		    client.query('SELECT * FROM orders WHERE group_id = \'' + req.body.group_id + '\' ' + qe + ' ORDER BY order_time DESC LIMIT ' + count + ' OFFSET ' + offset, (err_orders, res_orders) => {
		    	if (!res_orders) {
		    		return res.json({error: 1})
		    	}
		    	let items = []
		    	let user_ids = []
		    	let product_ids = []
		    	for (var i = 0; i < res_orders.rows.length; i++) {
		    		let item = res_orders.rows[i]
		    		item.comment = item.comment == null ? '' : item.comment
		    		item.type = item.type == null ? 0 : parseInt(item.type)
		    		items.push(item)
		    		user_ids.push(item.user_id)
		    		product_ids.push(item.item_ids)
		    	}
		    	let mapUsers = {}
		    	let mapMarket = {}
		    	appAPI('users.get', {user_ids: user_ids.join(','), fields: 'photo_100,photo_50'}, (users) => {
		    		for (var i = 0; i < users.length; i++) {
		    			let user = users[i]
		    			mapUsers['user' + user.id] = user
		    		}
		    		userAPI('market.getById', {item_ids: product_ids.join(','), extended: 1}, (markets) => {
		    			if (markets && markets.items) {
		    				markets = markets.items
		    			} else {
		    				markets = []
		    			}
		    			for (var i = 0; i < markets.length; i++) {
		    				let product = markets[i]
		    				mapMarket['product' + product.owner_id + '_' + product.id] = product
		    			}
		    			let newids = []
		    			for (var i = 0; i < items.length; i++) {
		    				let tem = items[i]
		    				tem.user = mapUsers['user' + tem.user_id]
		    				tem.product = mapMarket['product' + tem.item_ids]
		    				newids.push(tem)
		    			}
		    		    res.json({response: newids})
		    		})
		    	})
		    })
		    return 
		case 'save_settings':
		    req.body.url = req.body.url || ''
		    req.body.tinkoff_token = req.body.tinkoff_token || ''
		    req.body.inn = req.body.inn || ''
		    req.body.device_id = req.body.device_id || ''
		    return setSetting(req.body.group_id, req.body.url, req.body.tinkoff_token, req.body.inn, req.body.device_id, (is_ok) => {
		    	res.json({ok: is_ok})
		    }) 
		case 'get_settings': 
		    return getGroup(req.body.group_id, function(group) {
		    	if (!group) {
		    		return res.json({ok: false})
		    	}
		    	let settings = {
		    		inn: group.inn == null ? '' : group.inn,
		    		webhook: group.webhook == null ? '' : group.webhook,
		    		tinkoff_token: group.tinkoff_token == null ? '' : group.tinkoff_token,
		    		device_id: group.device_id == null ? '' : group.device_id
		    	}
		    	return res.json({ok: true, settings: settings})
		    })
		case 'change_status':
		    req.body.type = req.body.type || 0
		    if (req.body.type < 0 || req.body.type > 2) {
		    	req.body.type = 0
		    }
		    return setOrderStatus(req.body.type, req.body.group_id, (is_ok) => {
		    	return res.json({ok: is_ok})
		    })
		default:
		    return res.json({error: 'error'})
	}
})

app.listen(8000)

function checkSign(params) {
	var sign = []
	Object.keys(params).forEach(function(key) {
		if (key != 'hash' && key != 'sign') {
			sign.push(params[key])
		}
	})
	let secret = 'lRVniJmI4H2HngiFCMuP'
	sign = sign.join('')
	let hmac = crypto.createHmac('sha256', secret)
    let signed = hmac.update(new Buffer(sign, 'utf-8')).digest('hex')
	return signed === params.sign
}

function getGroup(group_id, callback) {
	client.query('SELECT * FROM groups WHERE group_id = ' + group_id, (err_get_group, res_get_group) => {
		if (err_get_group) {
			return callback(false)
		} else {
			if (!res_get_group.rows.length) {
				client.query('INSERT INTO groups(group_id) VALUES(' + group_id + ') RETURNING *', (err_add_group, res_add_group) => {
					if (err_add_group || !res_add_group.rows.length) {
						return callback(false)
					} else {
						return callback(res_add_group.rows[0])
					}
				})
			} else {
				return callback(res_get_group.rows[0])
			}
		}
	})
}

function setSetting(group_id, url_webhook, tinkoff_token, inn, device_id, callback) {
	if (url_webhook) {
		try {
		    if (url.parse(url_webhook)) {
			    let data = {group_id: group_id, key: 'check_server'}
		        request.post({ url: url_webhook, jsonData: data})
		    } else {
			    return callback(false)
		    }
	    } catch(e) {
		    return callback(false)
	    }
	}
	client.query('UPDATE groups SET device_id = \'' + device_id + '\', inn = \'' + inn + '\', webhook = \'' + url_webhook + '\', tinkoff_token = \'' + tinkoff_token + '\' WHERE group_id = ' + group_id + ';', (err_set_webhook, res_set_webhook) => {
		if (err_set_webhook) {
			console.log(err_set_webhook)
			return callback(false)
		}
		return callback(true)
	})
}

function setToken(group_id, group_token) {
	client.query('UPDATE groups SET access_token = \'' + group_token + '\' WHERE group_id = ' + group_id + ';', (err_set_token, res_set_token) => {})
}

function setCallBackServer(group_id, access_token, callback) {
	let hash = md5(rand()) + '' + md5(time()) + '' + md5(group_id)
	let secret = md5(rand() + time())
	api('groups.getCallbackConfirmationCode', {access_token: access_token, group_id: group_id}, (code) => {
		client.query('UPDATE groups SET confirmation_code = \'' + code.code + '\', callback_hash = \'' + hash + '\', callback_secret = \'' + secret + '\' WHERE group_id = ' + group_id + ';', (err_set_code, res_set_code) => {
			if (err_set_code) {
				return callback(false)
			} else {
				api('groups.addCallbackServer', {group_id: group_id, secret_key: secret, access_token: access_token, title: 'VK Pay', url: 'https://vkpayoff.ru/api/callback/' + hash}, (data) => {
					let server_id = data && data.server_id
					if (!server_id) {
						return callback(false)
					}
					api('groups.setCallbackSettings', {server_id: server_id, group_id: group_id, access_token: access_token, message_new: 1}, (settings) => {
						return callback(settings === 1)
					})
				})
			}
		})
	})
}

function addTo(products, user_id, group_id, callback) {
	let secret = md5(rand() + time()) + '' + md5(user_id + '_' + group_id)
	client.query('INSERT INTO orders(item_ids, group_id, cart_hash, status, user_id, order_time) VALUES(\'' + products.join(',') + '\', ' + group_id + ', \'' + secret + '\', 0, ' + user_id + ', ' + time() + ') RETURNING *', (err_add_group, res_add_group) => {
		if (res_add_group && !err_add_group) {
			callback('https://vkpayoff.ru/form?id=' + secret)
		}
	})
}

function setOrderStatus(type, id, callback) {
	client.query('SELECT * FROM orders WHERE cart_hash = \'' + id + '\'', (err_set_status, res_status_set) => {
		if (err_set_status || !res_status_set.rows.length) {
			callback(false)
		} else {
			client.query('UPDATE orders SET status = ' + type + ' WHERE cart_hash = \'' + id + '\' RETURNING *', (err_update_status, res_update_status) => {
				if (err_update_status || !res_update_status.rows.length) {
					return callback(false)
				} else {
					return callback(true)
				}
			})
		}
	})
}

function uploadQR(link, access_token, peer_id, callback) {
	api('photos.getMessagesUploadServer', {access_token: access_token, peer_id: peer_id}, (data) => {
		if (data && data.upload_url) {
			Utils.getBuffer('https://api.qrserver.com/v1/create-qr-code/', {size: '512x512', data: link}, (buffer, response) => {
			    if (buffer) {
			    	Utils.upload(data.upload_url, {
			    		photo: {
			    			filename: 'image.jpg',
			    			mimetype: 'image/jpeg',
			    			buffer: buffer
			    		}
			    	}, (body, res) => {
			    		try {
			    			body = JSON.parse(body)
			    			body.access_token = access_token
			    			api('photos.saveMessagesPhoto', body, (data) => {
			    				if (data && data.length) {
			    					callback(data[0])
			    				} else {
			    					callback(false)
			    				}
			    			})
			    		} catch(e) {
			    			callback(false)
			    		}
			    	})
			    } else {
			    	callback(false)
			    }
			})						
		} else {
			callback(false)
		}
	})
}
/*
function tinkoffGetToken(token, device, callback) {
	let data = {
		grant_type: 'refresh_token',
		refresh_token: token,
		device_id: device
	}
	request.post({url: 'https://openapi.tinkoff.ru/sso/secure/token', form: data, json: true}, function(body, response, err) {
		console.log(body)
	})
}

tinkoffGetToken('NCxO7jiuBjfodcej429wjHWArXSonsSEZsaThuAKuzFBPtvCW8NpKou8D3bRQnOoF9X0VS7B3gW7IyzLGRqTGQ==', 'user6' (data) => {

}) */

function rand(low, high) {
    low = low || 0
    high = high || (9 * 1000000)
    let r = Math.floor(Math.random() * (high - low + 1) + low)
    return r
}

function time() {
    return Math.round(new Date().getTime() / 1000)
}

function api(method, params, callback) {
	params.v = '5.68'
	request.post({url:'https://api.vk.com/method/' + method, form: params}, function(body, response, err) {
		if (!callback) {
			return
		}
		body = JSON.parse(body)
		if (body.response) {
			callback(body.response)
		} else {
			callback(body)
		}
	}) 
}

function appAPI(method, params, callback) {
	params.access_token = '615b4671615b4671615b4671a8610440206615b615b467138b2a9f471da961d16d919a9'
	api(method, params, callback)
}

function userAPI(method, params, callback) {
	params.access_token = 'eb81264e90f449428aceb6db93d6f0b7e137247bfd19c5cc983af5fbf3763f0865170208992c6f7da76d1'
	api(method, params, callback)
}
