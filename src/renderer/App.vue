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
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border: 1px solid #ccc;
        border-radius: 4px;
        overflow: hidden;
        background-color: #fff;
        transition: box-shadow .3s;

        &:hover {
            box-shadow: 0 0 10px rgba(33,33,33,.2) inset;
        }
    }
    input,
    button {
        font-family: $fonts;
    }
    .title-bar {
        position: relative;
        z-index: 10;
        -webkit-app-region: drag;
        line-height: 24px;
        font-size: 12px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);
    }
    .scrollbar::-webkit-scrollbar {
      width: 2px;
    }
    .scrollbar::-webkit-scrollbar-track {
      background: #ddd;
    }
    .scrollbar::-webkit-scrollbar-thumb {
      background: #999;
    }
</style>
