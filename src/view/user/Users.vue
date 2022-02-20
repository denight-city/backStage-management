<template>
    <div id="users">
        <!-- 面包屑导航 -->
        <bread :breadList="breadList"></bread>

        <el-card>
            <!-- 搜索区 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <!-- 用户添加 -->
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 表格区 -->
            <el-table :data="userList" border stripe>
                <el-table-column type="index"> </el-table-column>
                <el-table-column prop="username" label="姓名"> </el-table-column>
                <el-table-column prop="email" label="邮箱"> </el-table-column>
                <el-table-column prop="mobile" label="电话"> </el-table-column>
                <el-table-column prop="role_name" label="角色"> </el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="handleStateChange(scope.row)"> </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialogUser(scope.row.id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDialog(scope.row.id)"></el-button>
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRoleDialog(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalPage"
            >
            </el-pagination>
        </el-card>
        <!-- 添加用户区 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input type="email" v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input type="tel" v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="addDialogClosed">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 编辑用户区 -->
        <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input type="email" v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input type="tel" v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 分配角色 -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="20%" @close="setRoleDialogClosed">
            <p>当前的用户:{{ userInfo.username }}</p>
            <p>当前的角色:{{ userInfo.role_name }}</p>
            <p>
                分配新角色:
                <el-select v-model="selectedRoleId" placeholder="请选择">
                    <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
                </el-select>
            </p>

            <span slot="footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRole">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import bread from '../../components/bread/index.vue'
import { handleUser } from '../../api/users'
export default {
    name: 'users',
    components: { bread },
    data() {
        // 检测邮箱和手机号码
        var checkEmail = (rule, value, cb) => {
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if (regEmail.test(value)) {
                return cb()
            }

            cb(new Error('请输入合法的邮箱'))
        }
        var checkMobile = (rule, value, cb) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

            if (regMobile.test(value)) {
                return cb()
            }

            cb(new Error('请输入合法的手机号'))
        }
        return {
            breadList: ['用户管理', '用户列表'],
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 2,
            },
            userList: [],
            totalPage: 0,
            // 添加数据
            addDialogVisible: false,
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: '',
            },
            addFormRules: {
                username: [{ required: true, message: '请输入名称', trigger: 'blur' }],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' },
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' },
                ],
            },
            // 角色编辑
            editDialogVisible: false,
            editForm: {},
            editFormRules: {
                username: [{ required: true, message: '请输入名称', trigger: 'blur' }],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' },
                ],
                mobile: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' },
                ],
            },
            // 角色分配
            setRoleDialogVisible: false,
            userInfo: {},
            rolesList: [],
            selectedRoleId: '',
        }
    },
    methods: {
        // 获取数据
        async getUserList() {
            const { data: res } = await handleUser(this.queryInfo)
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.userList = res.data.users
            this.totalPage = res.data.total
        },
        // 页面处理
        handleSizeChange(val) {
            this.queryInfo.pagesize = val
            this.getUserList()
        },
        handleCurrentChange(val) {
            this.queryInfo.pagenum = val
            this.getUserList()
        },
        // 改变状态
        async handleStateChange(state) {
            const { data: res } = await this.$http.put(`users/${state.id}/state/${state.mg_state}`)
            if (res.meta.status !== 200) {
                state.mg_state = !state.mg_state
                return this.$messsage.error('获取数据失败')
            }
            this.getUserList()
        },
        // 添加用户
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
            this.addDialogVisible = false
        },
        async addUser() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return false
                const { data: res } = await this.$http.post('users', this.addForm)
                if (res.meta.status !== 201) return this.$messsage.error('获取数据失败')
                this.addDialogVisible = false
            })
        },
        // 编辑区域
        async editDialogUser(id) {
            this.editDialogVisible = true
            const { data: res } = await this.$http.get(`users/${id}`)
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.editForm = res.data
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
            this.editDialogVisible = false
        },
        async editUser() {
            this.$refs.editFormRef.validate(async (valid) => {
                if (!valid) return
                const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
                    id: this.editForm.id,
                    email: this.editForm.email,
                    mobile: this.editForm.mobile,
                })
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.getUserList()
                this.editDialogVisible = false
            })
        },
        // 删除区域
        async deleteDialog(id) {
            try {
                const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                })
                if (confirmResult === 'confirm') {
                    this.$message({
                        type: 'success',
                        message: '已成功删除',
                    })
                }
                const { data: res } = await this.$http.delete(`users/${id}`)
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.getUserList()
            } catch (err) {
                if (err === 'cancel') {
                    this.$message({
                        type: 'info',
                        message: '已取消删除',
                    })
                }
            }
        },
        // 角色分配区
        async setRoleDialog(state) {
            this.userInfo = state
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.rolesList = res.data
            this.setRoleDialogVisible = true
        },
        setRoleDialogClosed() {
            this.setRoleDialogVisible = false
            this.userInfo = ''
            this.selectedRoleId = ''
        },
        async saveRole() {
            if (!this.selectedRoleId) {
                return this.$message({
                    type: 'info',
                    message: '请选择角色',
                })
            }
            if (this.userInfo.username === 'admin') return this.$message.error('不能更改admin权限')
            const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
                rid: this.selectedRoleId,
            })
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.getUserList()
            this.setRoleDialogVisible = false
        },
    },
    created() {
        this.getUserList()
    },
}
</script>

<style lang="less" scoped></style>
