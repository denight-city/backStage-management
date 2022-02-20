<template>
    <div class="login_container">
        <div class="login_box">
            <div class="avatar_container">
                <img :src="avatarUrl" alt="头像" />
            </div>
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRule" class="login_form">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
                </el-form-item>
                <el-form-item class="login_btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            avatarUrl: require('../assets/logo.png'),
            loginForm: {
                username: 'admin',
                password: '123456',
            },
            loginFormRule: {
                username: [
                    { requirer: true, message: '请输入登录名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
                ],
                password: [
                    { requirer: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
                ],
            },
        }
    },
    methods: {
        login() {
            this.$refs.loginFormRef.validate(async (valid) => {
                if (!valid) return
                const { data: ret } = await this.$http.post('login', this.loginForm)
                if (ret.meta.status !== 200) return this.$message.error('登陆失败')
                window.sessionStorage.setItem('token', ret.data.token)
                this.$router.push('/home')
            })
        },
        resetForm() {
            this.$refs.loginFormRef.resetFields()
        },
    },
}
</script>

<style lang="less" scope>
.login_container {
    height: 100%;
    background-color: #2b4b6b;
}
.login_style(@w,@h,@bor) {
    //公共样式
    position: absolute;
    left: 50%;
    width: @w;
    height: @h;
    border-radius: @bor;
    background-color: #fff;
    transform: translate(-50%, -50%);
}
.login_box {
    top: 50%;
    .login_style(450px,300px,3px);
    .avatar_container {
        .login_style(130px,130px,50%);
        padding: 10px;
        border: 1px solid #eee;
        box-shadow: 0 0 10px #ddd;
        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
    .login_form {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
        .login_btns {
            display: flex;
            justify-content: flex-end;
        }
    }
}
</style>
