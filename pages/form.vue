<template>
    <section class="container">
        <h1 class="title">
            Оплата
        </h1>

        <div class="pay-form">
            <form>
                <input class="form-field form-input" placeholder="Номер карты" type="text">
                <input class="form-field form-input" placeholder="Имя Фамилия" type="text">
                <input class="form-field form-input" placeholder="Дата окончания" type="text">
                <input class="form-field form-input" placeholder="CVV-код" type="password">
                <button class="form-field btn" type="submit" v-on:click.capture="send">Оплатить</button>
            </form>
        </div>
    </section>
</template>

<script>
  // import axios from '~/plugins/axios'

  export default {
    head () {
      return {
        title: 'Оплата'
      }
    },
    data () {
      return {
        output: ''
      }
    },
    methods: {
      send: (event) => {
        console.log(event)
      },
      getFormValues (e) {
        e.preventDefault()
        this.output = this.$refs.my_input.value
      }
    }
  }
</script>

<style scoped>
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
