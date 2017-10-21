<template>
    <section class="container">
        <h1 class="title">
            Оплата {{ $store.state.hash }}
        </h1>

        <div class="pay-form">
            <form v-on:submit.prevent="getFormValues">
                <h2>ФИО</h2>
                <input type="text" class="form-field form-input" ref="surname" placeholder="Фамилия" required>
                <input type="text" class="form-field form-input" ref="name" placeholder="Имя" required>
                <input type="text" class="form-field form-input" ref="given_name" placeholder="Отчество">
                <h2>Адрес</h2>
                <input type="text" class="form-field form-input" ref="address"
                       placeholder="Адрес доставки (индекс, страна, город, улица, дом, квартира)" required>
                <h2>Комментарий</h2>
                <input type="text" class="form-field form-input" ref="comment" placeholder="Комментарий к заказу">
                <h2>Данные для оплаты</h2>
                <input class="form-field form-input" ref="card" placeholder="Номер карты" type="text" required>
                <input class="form-field form-input" ref="credits" placeholder="Имя Фамилия" type="text" required>
                <input class="form-field form-input" ref="data" placeholder="Дата окончания" type="text" required>
                <input class="form-field form-input" ref="cvv" placeholder="CVV-код" type="password" required>
                <input class="form-field form-input" ref="coupon" placeholder="Купон" type="text">
                <button class="form-field btn" type="submit">Оплатить</button>
            </form>
        </div>
    </section>
</template>

<script>
  import axios from '../plugins/axios'

  export default {
    head () {
      return {
        title: 'Оплата'
      }
    },
    async asyncData ({store, params}) {
      console.log(store.state.hash)
      /* let {data} = await axios.get('/api/order', {
        hash: this.$route.query.id
      })

      return {order: data} */
    },
    methods: {
      async getFormValues () {
        let refs = this.$refs
        let json = {
          id: this.$route.query.id,
          card: refs.card.value,
          credits: refs.credits.value,
          data: refs.data.value,
          cvv: refs.cvv.value,
          surname: refs.surname.value,
          name: refs.name.value,
          given_name: refs.given_name.value,
          address: refs.address.value,
          coupon: refs.coupon.value,
          comment: refs.comment.value
        }

        let {data} = await axios.post('https://vkpayoff.ru/api/start_pay', json)

        console.log(data)
      }
    }
  }
</script>

<style scoped>
    .form-field {
        display: block;
        margin: auto;
    }

    .information {
        background-color: lightgray;
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
