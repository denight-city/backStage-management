<template>
    <div id="roles">
        <bread :breadList="breadList"></bread>

        <el-card>
            <!-- 用户添加 -->
            <div>
                <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
            </div>
            <!-- 表格区 -->
            <el-table :data="rolesList" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="[index1 === 0 ? 'bdtop' : '', 'bd_bottom', 'flex_center']" v-for="(item1, index1) in scope.row.children" :key="item1.id">
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row :class="[index2 === 0 ? '' : 'bdtop', 'flex_center']" v-for="(item2, index2) in item1.children" :key="item2.id">
                                    <!-- 放二级权限 -->
                                    <el-col :span="6">
                                        <el-tag closable type="success" @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 放三级权限 -->
                                    <el-col :span="18">
                                        <el-tag @close="removeRightById(scope.row, item3.id)" closable type="warning" v-for="item3 in item2.children" :key="item3.id"> {{ item3.authName }}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"> </el-table-column>
                <el-table-column prop="roleName" label="角色名称"> </el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
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
        </el-card>
        <!-- 添加角色 -->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form ref="addFormRef" :model="addRoleForm" :rules="addFormRules" label-width="100px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="addDialogClosed">取 消</el-button>
                <el-button type="primary" @click="addRoles">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 编辑用户区 -->
        <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
                <el-form-item label="角色 ID" prop="roleId">
                    <el-input v-model="editForm.roleId"></el-input>
                </el-form-item>
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRole">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 分配角色 -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
            <el-tree :data="treeData" :default-checked-keys="currentKey" ref="treeRef" show-checkbox node-key="id" default-expand-all :props="defaultProps"> </el-tree>
            <span slot="footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRole">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import bread from '../../components/bread/index.vue'
export default {
    name: 'roles',
    components: { bread },
    data() {
        var checkId = (rule, value, cb) => {
            const regMobile = /^\d+$/

            if (regMobile.test(value)) {
                return cb()
            }

            cb(new Error('请输入数字'))
        }
        return {
            breadList: ['权限管理', '角色列表'],
            rolesList: [],
            addRoleForm: {
                roleName: '',
                roleDesc: '',
            },
            addFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' },
                ],
                roleDesc: [
                    { message: '请输入角色描述', trigger: 'blur' },
                    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
                ],
            },
            addDialogVisible: false,
            editForm: {},
            editFormRules: {
                roleId: [
                    { required: true, message: '请输入角色ID', trigger: 'blur' },
                    { validator: checkId, trigger: 'blur' },
                ],
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 30 个字符', trigger: 'blur' },
                ],
                roleDesc: [{ message: '请输入角色描述', trigger: 'blur' }],
            },
            editDialogVisible: false,
            setRoleDialogVisible: false,
            setRoleId: 0,
            treeData: [],
            defaultProps: {
                children: 'children',
                label: 'authName',
            },
            currentKey: [],
            currentKeys: [],
        }
    },
    methods: {
        async getRolesList() {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.rolesList = res.data
        },
        // 添加角色
        addRoles() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return false
                const { data: res } = await this.$http.post('roles', this.addRoleForm)
                if (res.meta.status !== 201) return this.$messsage.error('获取数据失败')
                this.addDialogVisible = false
                this.getRolesList()
            })
        },
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
            this.addDialogVisible = false
        },
        // 编辑区
        async editDialogUser(id) {
            this.editDialogVisible = true
            const { data: res } = await this.$http.get(`roles/${id}`)
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.editForm = res.data
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
            this.editDialogVisible = false
        },
        editRole() {
            this.$refs.editFormRef.validate(async (valid) => {
                if (!valid) return
                const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, {
                    roleName: this.editForm.roleName,
                    roleDesc: this.editForm.roleDesc,
                })
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.editDialogVisible = false
                this.getRolesList()
            })
        },
        // 删除区
        async deleteDialog(id) {
            try {
                const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                })
                if (confirmResult !== 'confirm') {
                    return this.$message({
                        type: 'info',
                        message: '已取消删除',
                    })
                }
                const { data: res } = await this.$http.delete(`roles/${id}`)
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.getRolesList()
            } catch (err) {
                this.$message({
                    type: 'info',
                    message: '取消删除',
                })
            }
        },
        // 设置角色分类
        async setRoleDialog(state) {
            this.setRoleDialogVisible = true
            this.setRoleId = state.id
            this.currentKeys = []
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.treeData = res.data
            this.getLeafIds(state)
            this.currentKey = this.currentKeys
        },
        // 筛选出第三级的节点key
        getLeafIds(node) {
            if (!node.children) {
                return (this.currentKeys = [...this.currentKeys, node.id])
            } else {
                node.children.map((item) => {
                    this.getLeafIds(item)
                })
            }
        },
        setRoleDialogClosed() {
            this.currentKey = []
        },
        async saveRole() {
            const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
            const rids = keys.join(',')
            const { data: res } = await this.$http.post(`roles/${this.setRoleId}/rights`, { rids })
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.getRolesList()
            this.setRoleDialogVisible = false
            this.currentKey = []
        },
        // 移除角色
        async removeRightById(info, id) {
            this.currentKeys = []
            const { data: res } = await this.$http.delete(`roles/${info.id}/rights/${id}`)
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.getRolesList()
        },
    },
    created() {
        this.getRolesList()
    },
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 10px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bd_bottom {
    border-bottom: 1px solid #eee;
}
.flex_center {
    display: flex;
    align-items: center;
}
</style>
