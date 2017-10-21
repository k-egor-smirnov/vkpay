<template>
    <div>
        <nuxt/>
    </div>
</template>

<script>
  import MyFooter from '~/components/Footer.vue'

  export default {
    components: {
      MyFooter
    }
  }
</script>

<style>
    @import "https://unpkg.com/spectre.css/dist/spectre.min.css";
    @import "https://unpkg.com/spectre.css/dist/spectre-exp.min.css";
    @import "https://unpkg.com/spectre.css/dist/spectre-icons.min.css";
    @import "https://cdnjs.cloudflare.com/ajax/libs/material-design-iconic-font/2.2.0/css/material-design-iconic-font.css";

    .container {
        margin: 0;
        width: 100%;
        padding: 100px 0;
        text-align: center;
    }

    .button, .button:visited {
        display: inline-block;
        color: black;
        letter-spacing: 1px;
        background-color: #fff;
        border: 2px solid #000;
        text-decoration: none;
        text-transform: uppercase;
        padding: 15px 45px;
    }

    .button:hover, .button:focus {
        color: #fff;
        background-color: #000;
    }

    .title {
        color: #000;
        font-weight: 300;
        font-size: 2.5em;
        margin: 0;
    }
</style>
