<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
    export default {
        name: 'GhostBoard'
    }
</script>

<style lang="scss">
    @import "~@/assets/constant.scss";

    html,
    body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        font-family: $fonts;
        font-size: 14px;
    }
    #app {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>
