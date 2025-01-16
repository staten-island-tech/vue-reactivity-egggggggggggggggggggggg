<template>
  <div>
    <li v-for="stuff in form">  
      {{ stuff }}
    </li>
    <form @submit.prevent="">
      <input type="text" v-model="form.username">
      <input type="password" v-model="form.password">
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
  const form =  reactive({
    username:"",
    password:""
  })
  function logUsernamePassword()
  {

  }
</script>

<style scoped>
</style>