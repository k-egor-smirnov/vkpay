<template>
  <section class="container">
    <header class="navbar">
      <section class="left-section navbar-section">
        <div class="search-block has-icon-left">
          <input type="text" class="input-search-field form-input" placeholder="Поиск по товарам категории...">
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
        <button class="right-btn btn btn-link circle">
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
        <li class="li-order">
          <div class="order-title-block">
            <figure class="user-ava avatar avatar-lg" data-initial="YZ" style="background-color: #5755d9;"></figure>
            <div class="content">
              <div class="order-title">Сок из носок (10)</div>
              <div class="order-time">29 апреля 2017 в 20:16</div>
              <div class="user-name">Иван пиздорван</div>
            </div>
          </div>
        </li>

        <li class="li-order">
          <div class="order-title-block">
            <figure class="user-ava avatar avatar-lg" data-initial="YZ" style="background-color: #5755d9;"></figure>
            <div class="content">
              <div class="order-title">Сок из носок (10)</div>
              <div class="order-time">29 апреля 2017 в 20:16</div>
              <div class="user-name">Иван пиздорван</div>
            </div>
          </div>
        </li>

        <li class="li-order">
          <div class="order-title-block">
            <figure class="user-ava avatar avatar-lg" data-initial="YZ" style="background-color: #5755d9;"></figure>
            <div class="content">
              <div class="order-title">Сок из носок (10)</div>
              <div class="order-time">29 апреля 2017 в 20:16</div>
              <div class="user-name">Иван пиздорван</div>
            </div>
          </div>
        </li>

        <li class="li-order">
          <div class="order-title-block">
            <figure class="user-ava avatar avatar-lg" data-initial="YZ" style="background-color: #5755d9;"></figure>
            <div class="content">
              <div class="order-title">Сок из носок (10)</div>
              <div class="order-time">29 апреля 2017 в 20:16</div>
              <div class="user-name">Иван пиздорван</div>
            </div>
          </div>
        </li>
      </ul>
    </div>

  </section>
</template>

<script>
  /* eslint-disable */

  // import axios from '~/plugins/axios'

  import OrderItem from '~/components/order_item.vue'

  export default {
    components: {
      OrderItem
    }
  }
</script>

<style scoped>
  /** {margin: 0; padding: 0;}*/

  .ul-order {
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
