<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: 'ghostboard'
    }
</script>

<style lang="scss">
    @import "~@/assets/constant.scss";

    html,
    body {
        margin: 0;
        padding: 0;
        font-family: $fonts;
    }
</style>
