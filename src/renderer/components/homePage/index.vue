<template>
    <div class="container">
        <div class="board">
            <el-row class="header">
                <el-col :span="8">股票代码</el-col>
                <el-col :span="8">股票名</el-col>
                <el-col :span="8">现价</el-col>
            </el-row>
            <el-row
                class="item-list"
                v-for="(item, idx) in tableData"
                :key="idx"
                :class="{show: idx === currentIdx}"
                :style="{'font-size': settingsData.fontSize + 'px'}"
                @mouseenter.native="mouseEnter(item, idx)"
                @mouseleave.native="mouseLeave"
            >
                <el-col :span="8">{{ item.code }}</el-col>
                <el-col :span="8">{{ item.name }}</el-col>
                <el-col :span="8">{{ item.price }}</el-col>
                <div class="btns">
                    <span @click="fenshiClick(item.key)">分时</span>
                    <span @click="stickyClick(item.key)">置顶</span>
                    <span @click="deleteClick(item.key)">删除</span>
                </div>
            </el-row>
        </div>
        <div class="wrapper">
            <div class="opt-btns">
                <el-row>
                    <el-button type="primary" icon="el-icon-search" circle size="mini" @click="searchClick"></el-button>
                    <el-button type="primary" icon="el-icon-edit" circle size="mini" @click="settingClick"></el-button>
                    <el-button type="primary" icon="el-icon-help" circle size="mini" @click="helpClick"></el-button>
                    <el-button type="primary" icon="el-icon-info" circle size="mini" @click="infoClick"></el-button>
                </el-row>
            </div>
            <div class="show-hide-area">
                <div class="search" v-show="showSearch" ref="searchList">
                    <el-autocomplete
                        v-model="searchText"
                        :fetch-suggestions="doSearch"
                        :trigger-on-focus="false"
                        @select="handleSelect"
                        style="width: 90%"
                        size="small"
                        placeholder="输入股票代码搜索"
                    >
                        <template slot-scope="{ item }">
                            <div class="sug-item">
                                <div class="code">{{ item.code }}</div>
                                <div class="name">{{ item.name }}</div>
                            </div>
                        </template>
                    </el-autocomplete>
                </div>
                <div class="settings" v-show="showSettings" ref="settings">
                    <el-form :model="settingsData" label-width="80px">
                        <el-form-item label="字号">
                            <el-slider v-model="settingsData.fontSize" show-input input-size="mini" :max="24" :min="12"></el-slider>
                        </el-form-item>
                        <el-form-item style="text-align: left;">
                            <el-button size="mini" type="primary" @click="handleSaveSettings">保存</el-button>
                            <el-button size="mini" @click="handleCancelSaveSettings">取消</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    import storage from "electron-json-storage";
    import { BASE_API_URL, DEFAULT_CODE } from "@/config";
    import baseWinConfig from '../../../config/window.config'
    import { remote, shell } from 'electron';

    export default {
        data () {
            return {
                // 当前鼠标hover的条目序号
                currentIdx: '',
                // 当前的request对象
                currentRq: null,
                // 关注的股票列表信息
                tableData: [],
                timer: null,

                // 搜索相关
                searchText: '',
                showSearch: false,
                searchResults: [],
                searchLoading: false,

                // 设置相关
                settingsData: {
                    fontSize: 14,
                },
                showSettings: false,
            }
        },
        beforeCreate () {
            storage.get('settingsData', (err, data) => {
                if (err) throw err;

                if (data) {
                    this.settingsData = data
                }
            })
        },
        mounted () {
            this.intervalFetchData()
        },
        methods: {
            intervalFetchData () {
                if (this.timer) clearInterval(this.timer)
                this.fetchTableData()
                this.timer = setInterval(this.fetchTableData, 5000)
            },
            fetchTableData () {
                storage.get('keys', (err, data) => {
                    if (err) throw err;

                    console.log('keys:', data)
                    const params = Array.isArray(data) ? data : [DEFAULT_CODE]
                    const CancelToken = axios.CancelToken;

                    if (this.currentRq) this.currentRq.cancel('request canceled')
                    this.currentRq = CancelToken.source()

                    if (!params.length) return
                    axios.post(BASE_API_URL, JSON.stringify(params), {
                        headers: { 'content-type': 'application/json' },
                        cancelToken: this.currentRq.token
                    }).then(res => {
                        return res.data || []
                    }).then(data => {
                        this.currentRq = null
                        this.tableData = data
                    }).catch(err => {
                        this.currentRq = null
                        console.log("NOTOK:"+JSON.stringify(err))
                    })
                })
            },
            mouseEnter (item, idx) {
                console.log(item, idx)
                this.currentIdx = idx
            },
            mouseLeave () {
                this.currentIdx = ''
            },
            fenshiClick (key) {
                const conf = Object.assign({}, baseWinConfig, {
                    width: 800,
                    height: 500,
                })
                let win = new remote.BrowserWindow(conf)
                let winURL = window.location.href;
                let uri = winURL.substring(0, winURL.indexOf("#")) + `#/fenshi?key=${key}`;

                win.loadURL(uri);
                if (process.env.NODE_ENV === 'development') {
                    win.webContents.openDevTools({mode: 'detach'})
                }
                win.once('ready-to-show', () => {
                    win.show()
                })
                win.on('closed', () => {
                    win = null
                })
            },
            stickyClick (key) {
                storage.get('keys', (err, data) => {
                    if (err) throw err;

                    data = Array.isArray(data) ? [].concat(data) : []

                    let keyIndex = data.indexOf(key)

                    if (keyIndex > -1) {
                        data.splice(keyIndex, 1)
                        data.unshift(key)
                    } else {
                        data.unshift(key)
                    }
                    storage.set('keys', data, err => {
                        if (err) throw err;

                        this.intervalFetchData()
                        console.log("set keys ok ")
                    })
                })
            },
            deleteClick (key) {
                storage.get('keys', (err, data) => {
                    if (err) throw err;

                    data = Array.isArray(data) ? data : []

                    let keyIndex = data.indexOf(key)

                    if (keyIndex > -1) {
                        data.splice(keyIndex, 1)
                    }
                    storage.set('keys', data, err => {
                        if (err) throw err;

                        this.intervalFetchData()
                        console.log("set keys ok ")
                    })
                })
            },
            searchClick () {
                this.showSearch = !this.showSearch
                this.showSettings = false
                if (this.showSearch && this.$refs.searchList) {
                    this.$nextTick(() => {
                        this.$refs.searchList.scrollIntoView()
                    })
                }
            },
            settingClick () {
                this.showSettings = !this.showSettings
                this.showSearch = false
                if (this.showSettings && this.$refs.showSettings) {
                    this.$nextTick(() => {
                        this.$refs.showSettings.scrollIntoView()
                    })
                }
            },
            handleSaveSettings () {
                storage.set('settingsData', this.settingsData, err => {
                    if (err) throw err;

                    this.showSettings = !this.showSettings
                    this.$message.success({message: '设置已保存', duration: 1500})
                })
            },
            handleCancelSaveSettings () {
                this.showSettings = !this.showSettings
            },
            helpClick () {
                // @TODO 替换为真实的地址
                shell.openExternal('https://www.baidu.com');
            },
            infoClick () {
                // @TODO 替换为真实的地址
                shell.openExternal('https://www.baidu.com');
            },
            doSearch (queryStr, cb) {
                axios.get(BASE_API_URL + '/sug', {
                    params: {
                        key: queryStr + '@a'
                    },
                    headers: { 'content-type': 'application/json' },
                }).then(res => {
                    return res.data && res.data.value || []
                }).then(data => {
                    cb(data)
                })
            },
            handleSelect (value) {
                storage.get('keys', (err, data) => {
                    if (err) throw err

                    data = Array.isArray(data) ? data : []

                    if (!data.includes(value.key)) {
                        data.push(value.key)
                        storage.set('keys', data, err => {
                            if (err) throw err

                            this.intervalFetchData()
                        })
                    }
                })
            }
        }
    }
</script>

<style lang="scss">
    @import "~@/assets/constant.scss";
    @import "~@/assets/mixins.scss";

    .container {
        display: flex;
        flex-direction: column;
        height: 100%;
        text-align: center;

        .board {
            flex: 1;
            padding: 10px;
            overflow: scroll;
            -webkit-overflow-scrolling: touch;

            .header {
                position: relative;
                font-family: $fontsBold;
                line-height: 54px;
                overflow: hidden;
                @include genBorder(#ebeef5, bottom);
            }
            .item-list {
                position: relative;
                line-height: 44px;
                overflow: hidden;
                @include genBorder(#ebeef5, bottom);

                &:nth-child(2n+1) {
                    background-color: #f9f9f9;
                }
                &:hover {
                    background-color: #f2f5f9;
                }
                .btns {
                    position: absolute;
                    right: 20px;
                    top: 50%;
                    display: none;
                    border-radius: 4px;
                    background-color: #398bfb;
                    overflow: hidden;
                    transform: translateY(-50%);
                    cursor: pointer;
                    transition: all ease 0.3s;

                    span {
                        position: relative;
                        align-items: center;
                        width: 40px;
                        font-family: $fonts;
                        font-size: 12px;
                        line-height: 24px;
                        color: #fff;
                        transition: all ease 0.3s;

                        &:not(:last-child):after {
                            content: '';
                            position: absolute;
                            right: 0;
                            top: 0;
                            display: block;
                            width: 1px;
                            height: 100%;
                            background-color: rgba(255, 255, 255, .5);
                        }
                        &:hover {
                            background-color: #59a0fb;
                        }
                        &:active {
                            background-color: #337bdc;
                        }
                    }
                }
                &.show .btns {
                    display: flex;
                    opacity: 0.5;

                    &:hover {
                        opacity: 1;
                    }
                }
            }
        }
        .opt-btns {
            padding: 10px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.1);
        }
        .show-hide-area {
            .search {
                margin: 20px;
            }
            .settings {
                padding: 0 20px;
                .el-form-item {
                    margin-bottom: 14px;
                }
            }
        }
    }
    .sug-item {
        display: flex;

        & > div {
            flex: 1;
        }
    }
</style>
