<template>
  <section class="container">
    <script type="text/javascript">
      /* eslint-disable */
      window.onload = function () {
        VK.init(function () {
          console.log('init success')
          setInterval(function () {
            VK.callMethod('resizeWindow', 820, document.body.scrollHeight);
          }, 500)
        }, function () {
          console.log('api connection error')
          // API initialization failed
          // Can reload page here
        }, '5.68')
      }
    </script>

    <header class="navbar">
      <section class="left-section navbar-section">
        <div class="search-block has-icon-left">
          <input type="text" class="input-search-field form-input"
                 placeholder="Поиск по товарам категории...">
          <i class="form-icon icon icon-search"></i>
        </div>
      </section>
      <section class="right-section navbar-section">
        <button class="right-btn btn btn-link circle">
          <i class="right-icon zmdi zmdi-filter-list zmdi-hc-lg"></i>
        </button>
        <!--<button class="right-btn btn badge btn-link circle" data-badge="10">
          <i class="right-icon zmdi zmdi-shopping-cart zmdi-hc-lg"></i>
        </button>-->
        <button v-on:click="isActive=true" class="right-btn btn btn-link circle">
          <i class="right-icon zmdi zmdi-settings zmdi-hc-lg"></i>
        </button>
      </section>
    </header>

    <ul class="tab">
      <li class="tab-item active">
        <a href="#">Все</a>
      </li>
      <li class="tab-item">
        <a href="#">Услуги</a>
      </li>
      <li class="tab-item">
        <a href="#">Бытовая техника</a>
      </li>
      <li class="tab-item">
        <a href="#">Садовые приборы</a>
      </li>
    </ul>

    <div class="order-list-block">
      <ul class="ul-order">
        <li v-for="item in $store.state.items" class="li-order">
          <div class="order-title-block">
            <figure class="user-ava avatar avatar-lg" data-initial="YZ"
                    style="background-color: #5755d9;"></figure>
            <div class="content">
              <div class="order-title">{{ item.user_id }} </div>
              <div class="order-time">29 апреля 2017 в 20:16</div>
              <div class="user-name">Иван пиздорванa</div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div v-bind:class="{ active: isActive }" class="modal">

      <div v-on:click="isActive=false" class="modal-overlay"></div>

      <div class="modal-container">
        <div class="modal-header">
          <button v-on:click="isActive=false" class="btn btn-clear float-right"></button>
          <div class="modal-title h5">Настройки</div>
        </div>

        <div class="modal-body">
          <div class="content">
            <form v-on:submit.prevent="saveSettings">
              <input class="form-input" type="text" id="input-webhook" ref="webhook" placeholder="Webhook"
                     v-bind:value="$store.state.settings.webhook">
              <input class="form-input" type="text" id="input-tb-token" ref="token" placeholder="ТинькоффБанк Token"
                     v-bind:value="$store.state.settings.tinkoff_token">
              <input class="form-input" type="text" id="input-inn" ref="inn" placeholder="ИНН"
                     v-bind:value="$store.state.settings.inn">
              <input class="form-input" type="text" id="input-device-id" ref="deviceid" placeholder="Тинькофф device id"
                     v-bind:value="$store.state.settings.device_id">
              <button class="btn btn-primary" type="submit">Сохранить</button>
            </form>
          </div>
        </div>

        <div class="modal-footer">
          <transition name="fade">
            <div v-if="showSuccess" class="toast toast-success">
              Настройки сохранены.
            </div>
          </transition>
          <transition name="fade">
            <div v-if="showWarning" class="toast toast-warning">
              Варнинг, ептыбля ыыыыы)))00)000
            </div>
          </transition>
          <transition name="fade">
            <div v-if="showError" class="toast toast-error">
              Ошибка при сохранении настроек. Проверье вводимые данные.
            </div>
          </transition>
        </div>

      </div>

    </div>

  </section>
</template>

<script>
  /* eslint-disable */

  import axios from '~/plugins/axios'

  import OrderItem from '~/components/order_item.vue'

  export default {
    components: {
      OrderItem
    },
    async mounted() {
      this.$store.state.query = this.$route.query
      await this.getItems()
      await this.getSettings()
    },
    data() {
      return {
        isActive: false,
        showSuccess: false,
        showWarning: false,
        showError: false
      }
    },
    methods: {
      async getItems() {
        let {data} = await axios.post('https://vkpayoff.ru/api/admin/get_orders', {
          viewer_id: this.$store.state.query.viewer_id,
          group_id: this.$store.state.query.group_id,
          auth_key: this.$store.state.query.auth_key
        })

        this.$store.state.items = data.response
//        return data.response
      },
      async getSettings() {
        let {data} = await axios.post('https://vkpayoff.ru/api/admin/get_settings', {
          viewer_id: this.$store.state.query.viewer_id,
          group_id: this.$store.state.query.group_id,
          auth_key: this.$store.state.query.auth_key
        })

        console.log(data)

        this.$store.state.settings = data.settings
      },
      closeModal() {
        this.isActive = false

        this.showSuccess = this.showError = false
      },
      async saveSettings() {
        console.log('start sending new settings')

        let {data} = await axios.post('https://vkpayoff.ru/api/admin/save_settings', {
          url: this.$refs.webhook.value,
          tinkoff_token: this.$refs.token.value,
          inn: this.$refs.inn.value,
          device_id: this.$refs.deviceid.value,
          viewer_id: this.$store.state.query.viewer_id,
          group_id: this.$store.state.query.group_id,
          auth_key: this.$store.state.query.auth_key
        })

        if (data.ok) {
          this.$store.state.settings.webhook = this.$refs.webhook.value
          this.$store.state.settings.tinkoff_token = this.$refs.token.value
          this.$store.state.settings.inn = this.$refs.inn.value
          this.$store.state.settings.device_id = this.$refs.deviceid.value

          this.showSuccess = !this.showSuccess
        } else {
          this.showError = !this.showError
        }

        setTimeout(this.closeModal, 1400)
      }
    },
    head() {
      return {
        script: [
          {type: 'text/javascript', src: 'https://vk.com/js/api/xd_connection.js', async: false, body: false}
        ]
      }
    }
  }
</script>

<style scoped>
  /** {margin: 0; padding: 0;}*/

  .toast {
    text-align: left;
  }

  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active до версии 2.1.8 */
  {
    opacity: 0;
  }

  .form-input {
    margin-bottom: 10px;
  }

  .ul-order {
    /*overflow-y:auto;*/
    list-style-type: none;
    width: 100%;
  }

  .li-order {
    height: 70px;
  }

  .li-order:hover {
    background: #eee;
    cursor: pointer;
  }

  .order-title-block {
    text-align: left;
    height: 70px;
    display: flex;
    background: white;
    flex-direction: row;
    margin-bottom: 10px;
    margin-top: 10px;
    align-items: center;
  }

  .order-title-block:hover {
    background: #eee;
    cursor: pointer;
  }

  .content {
    display: flex;
    justify-content: space-around;
    flex-direction: column;
    margin-left: 10px;
  }

  .user-ava {
    margin-left: 12px;
  }

  .order-title-block:before {
    content: "";
    height: 100%;
    width: 6px;
    background: greenyellow;
    display: flex;
    border-radius: 10px;
  }

  .order-title {
    padding-top: 10px;
  }

  .order-time {
    font-size: 12px;
  }

  .user-name {
    padding-bottom: 10px;
  }

  .navbar {
    background-color: #507299;
    height: 56px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 125;
    padding-left: 16px;
    padding-right: 16px;
  }

  .tab {
    width: 100%;
    top: 52px;
    left: 0;
    z-index: 125;
    padding-left: 12px;
    padding-right: 12px;
    position: fixed;
    background: #507299;
    border-bottom: none;
    color: lightgray;
    flex-wrap: nowrap;
  }

  .tab .tab-item a:focus, .tab .tab-item a:hover {
    color: white;
    box-shadow: 0 0 0 .1rem rgba(255, 255, 255, 0)
  }

  .tab .tab-item a.active, .tab .tab-item.active a {
    border-bottom-color: white;
    color: white;
  }

  .badge[data-badge]::after,
  .badge:not([data-badge])::after {
    background: red;
    background-clip: padding-box;
    border-radius: .5rem;
    box-shadow: 0 0 0 .08rem #fff;
    color: #fff;
    content: attr(data-badge);
    display: inline-block;
    transform: translate(-.1rem, -.5rem);
  }

  .badge[data-badge]::after {
    font-size: .65rem;
    height: .9rem;
    line-height: 1;
    min-width: .9rem;
    padding: .1rem .2rem;
    text-align: center;
    white-space: nowrap;
  }

  .badge.btn::after {
    position: absolute;
    right: 0;
    top: 0;
    transform: translate(50%, -50%);
  }

  .btn:focus {
    box-shadow: 0 0 0 .1rem rgba(255, 255, 255, 0)
  }

  .icon {
    color: white;
  }

  .left-section {
    justify-content: flex-start !important;
  }

  .right-section {
    justify-content: flex-end !important;
  }

  .right-icon {
    color: white;
  }

  .right-btn {
    margin-left: 12px;
  }

  .search-block {
    width: 50%;
    justify-content: flex-start;
    display: inline-block;
  }

  .input-search-field {
    box-shadow: 0 0 0 .1rem rgba(255, 255, 255, 0);
    color: white;
    background-color: transparent;
    border-color: transparent;
    width: 100%;
  }

  .form-field {
    display: block;
    margin: auto;
  }

  .pay-form {
    max-width: 604px;
    width: auto;
    margin: auto;
  }

  button.form-field {
    margin-top: 20px;
  }

  input.form-field {
    margin-top: 5px;
  }

  .title {
    margin: 30px 0;
  }

  .users {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .user {
    margin: 10px 0;
  }
</style>
