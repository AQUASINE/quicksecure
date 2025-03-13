<script setup>
import {userManager, signOutRedirect} from "../helper/signin.js";
import {onMounted} from "vue";

userManager.signinCallback().then((user) => {
  console.log('Sign In Callback', user)
})

const signIn = async () => {
  console.log('Sign In')
  await userManager.signinRedirect();
}

const signOut = async () => {
  console.log('Sign Out')
  await signOutRedirect();
}
</script>

<template>
  <div>
    <h1>
      Quicksecure
    </h1>
    <p>
      This is the main page of Quicksecure. I will need to add:
    </p>
    <ul>
      <li>Router</li>
      <li>Icons</li>
      <li>Sidebar</li>
      <li>Incident Forms</li>
      <li>Incident List</li>
      <li>Stats</li>
    </ul>
    <button @click="signIn">
      Sign In
    </button>
    <button @click="signOut">
      Sign Out
    </button>
  </div>
</template>

<style scoped>

</style>