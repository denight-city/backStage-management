<template>
    <el-container class="home_container">
        <el-header class="header_container">
            <div class="header_left">
                <img :src="logoUrl" alt="logo" />
                <p>vue后台管理系统</p>
            </div>
            <div class="header_right">
                <el-button type="info" @click="exit">退出</el-button>
            </div>
        </el-header>
        <!-- 侧边栏 -->
        <el-container>
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle_button" @click="toggleCollapse">|||</div>
                <el-menu :default-active="activePath" :collapse="isCollapse" background-color="#313743" text-color="#fff" active-text-color="#439bf4" unique-opened router :collapse-transition="false">
                    <!-- 一级菜单栏 -->
                    <el-submenu :index="`${item.id}`" v-for="(item, index) in menuList" :key="item.id">
                        <template slot="title">
                            <i :class="iconArr[index]"></i>
                            <span>{{ item.authName }}</span>
                        </template>
                        <!-- 二级菜单栏 -->
                        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="savePath('/' + subItem.path)">
                            <i class="el-icon-menu"></i>
                            <span slot="title">{{ subItem.authName }}</span>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    name: 'home',
    data() {
        return {
            logoUrl: require('../assets/logo.png'),
            isCollapse: false,
            menuList: [],
            iconArr: ['iconfont icon-user', 'iconfont icon-tijikongjian', 'iconfont icon-shangpin', 'iconfont icon-danju', 'iconfont icon-baobiao'],
            // 当前激活的选项
            activePath: '',
        }
    },
    methods: {
        exit() {
            window.sessionStorage.clear('token')
            this.$router.push('login')
        },
        async getMenuData() {
            const { data: res } = await this.$http.get('menus')
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.menuList = res.data
        },
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        savePath(activePath) {
            this.activePath = activePath
            // 刷新页面时不会关闭页面，所以需要保存
            window.sessionStorage.setItem('activePath', activePath)
        },
    },
    created() {
        this.getMenuData()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
}
</script>

<style lang="less" scoped>
.home_container {
    height: 100%;
}
.flex_style() {
    display: flex;
    align-items: center;
    vertical-align: center;
}
.header_container {
    display: flex;
    justify-content: space-between;
    align-content: center;
    padding-left: 0;
    background-color: #363c42;
    font-size: 15px;
    color: #fff;
    .header_left {
        .flex_style();
        img {
            height: 80%;
        }
        p {
            margin-left: 20px;
        }
    }
    .header_right {
        .flex_style();
    }
}
.el-aside {
    background-color: #313743;

    .el-menu {
        width: 100%;
        border-right: none;
        i {
            margin-right: 10px;
        }
    }
}
.toggle_button {
    background-color: #4b5063;
    font-size: 10px;
    color: #fff;
    line-height: 24px;
    letter-spacing: 1px;
    text-align: center;
    cursor: pointer;
}
.el-main {
    background-color: #e9edf1;
}
</style>
