<template>
    <div id="categories">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 添加角色 -->
            <div>
                <el-button type="primary" @click="addDialogVisible = true">添加分类</el-button>
            </div>
            <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="true" class="treeTable">
                <template slot="isOk" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
                    <i class="el-icon-error" v-else style="color: red"></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" v-else>三级</el-tag>
                </template>
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialogUser(scope.row.cat_id)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDialog(scope.row.cat_id)"></el-button>
                </template>
            </tree-table>
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
        <!-- 添加分类 -->
        <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form ref="addRef" :model="addCateForm" :rules="addFormRules" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <el-cascader :options="parentCateList" :props="cascaderProps" v-model="selectedKeys" @change="parentCateChanged" clearable> </el-cascader>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCates">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 编辑用户区 -->
        <el-dialog title="编辑分类" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
                <el-form-item label="分配ID" prop="cat_id">
                    <el-input v-model="editForm.cat_id"></el-input>
                </el-form-item>
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRole">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'categories',
    data() {
        var checkId = (rule, value, cb) => {
            const regMobile = /^\d+$/

            if (regMobile.test(value)) {
                return cb()
            }

            cb(new Error('请输入数字'))
        }
        return {
            cateList: [],
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5,
            },
            totalPage: 0,
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name',
                },
                {
                    label: '是否有效',
                    type: 'template',
                    template: 'isOk',
                },
                {
                    label: '排序',
                    type: 'template',
                    template: 'order',
                },
                {
                    label: '操作',
                    type: 'template',
                    template: 'opt',
                },
            ],
            addDialogVisible: false,
            addCateForm: {
                cat_pid: '',
                cat_name: '',
                cat_level: '',
            },
            addFormRules: {
                cat_name: [
                    { required: true, message: '请输入分配名称', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 30 个字符', trigger: 'blur' },
                ],
            },
            parentCateList: [],
            cascaderProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
            },
            selectedKeys: [],
            editDialogVisible: false,
            editForm: {},
            editFormRules: {
                cat_id: [
                    { required: true, message: '请输入分配ID', trigger: 'blur' },
                    { validator: checkId, trigger: 'blur' },
                ],
                cat_name: [
                    { required: true, message: '请输入分配名称', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 30 个字符', trigger: 'blur' },
                ],
            },
        }
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.totalPage = res.data.total
            this.cateList = res.data.result
        },
        handleSizeChange(size) {
            this.queryInfo.pagesize = size
            this.getCateList()
        },
        handleCurrentChange(num) {
            this.queryInfo.pagenum = num
            this.getCateList()
        },
        addDialogClosed() {
            this.$refs.addRef.resetFields()
        },
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', {
                params: { type: 2 },
            })

            if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！')
            this.parentCateList = res.data
        },
        parentCateChanged() {
            if (this.selectedKeys.length > 0) {
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                this.addCateForm.cat_level = this.selectedKeys.length
            } else {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        addCates() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return false
                const { data: res } = await this.$http.post('categories', this.addCateForm)
                if (res.meta.status !== 201) return this.$messsage.error('获取数据失败')
                this.addDialogVisible = false
                this.getCateList()
            })
        },
        // 编辑区
        async editDialogUser(id) {
            this.editDialogVisible = true
            const { data: res } = await this.$http.get(`categories/${id}`)
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.editForm = res.data
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        editRole() {
            this.$refs.editFormRef.validate(async (valid) => {
                if (!valid) return
                const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}`, {
                    cat_name: this.editForm.cat_name,
                })
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.editDialogVisible = false
                this.getCateList()
            })
        },
        // 删除区
        async deleteDialog(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
            })
            if (confirmResult === 'cancel') {
                return this.$message({
                    type: 'info',
                    message: '已取消删除',
                })
            }
            const { data: res } = await this.$http.delete(`categories/${id}`)
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.getCateList()
        },
    },
    created() {
        this.getCateList()
        this.getParentCateList()
    },
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
</style>
