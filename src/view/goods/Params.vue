<template>
    <div id="params">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-alert title="注意:只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"> </el-alert>
                </el-col>
            </el-row>
            <el-row class="cas_content">
                <el-col>
                    选择商品分类:
                    <el-cascader :props="cateProps" v-model="currentVal" :options="cateList" @change="handleChange" clearable></el-cascader>
                </el-col>
            </el-row>
            <el-menu :default-active="activeIndex" class="el-menu-container" mode="horizontal" @select="handleState">
                <el-menu-item index="1">动态参数</el-menu-item>
                <el-menu-item index="2">静态属性</el-menu-item>
            </el-menu>
            <div class="addBtn">
                <el-button :disabled="isactive" size="mini" type="primary" @click="addDialogVisible = true">添加参数</el-button>
            </div>
            <el-table :data="ParamsList" ref="expandRef" border stripe @expand-change="handleRow" :row-key="getRowKeys" :expand-row-keys="expands">
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-tag :key="index" v-for="(item, index) in scope.row.attr_vals" closable :disable-transitions="false" @close="handleClose(scope.row, index)">
                            {{ item }}
                        </el-tag>
                        <el-input
                            v-if="inputVisible"
                            v-model="inputValue"
                            ref="saveTagInput"
                            size="small"
                            @keyup.enter.native="handleInputConfirm(scope.row)"
                            @blur="handleInputConfirm(scope.row)"
                            class="newTagIpt"
                        >
                        </el-input>
                        <el-button v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialogUser(scope.row)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDialog(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 添加参数-->
        <el-dialog title="添加参数" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form ref="addFormRef" :model="addParamsForm" :rules="addFormRules" label-width="100px">
                <el-form-item label="分类名称" prop="attr_name">
                    <el-input v-model="addParamsForm.attr_name"></el-input>
                </el-form-item>
                <el-form-item v-if="pageState === 'many'" label="可选参数" prop="attr_vals">
                    <el-input v-model="addParamsForm.attr_vals"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 编辑参数 -->
        <el-dialog title="编辑参数" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form ref="editFormRef" :model="editParamsForm" :rules="editFormRules" label-width="100px">
                <el-form-item label="分类名称" prop="attr_name">
                    <el-input v-model="editParamsForm.attr_name"></el-input>
                </el-form-item>
                <el-form-item label="分类参数" prop="attr_vals">
                    <el-input v-model="editParamsForm.attr_vals"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: 'params',
    data() {
        return {
            currentVal: [],
            cateProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
            },
            activeIndex: '1',
            cateList: [],
            pageState: 'many',
            ParamsList: [],
            inputVisible: false,
            inputValue: '',
            expands: [],
            addDialogVisible: false,
            addParamsForm: {
                attr_name: '',
                attr_vals: '',
            },
            addFormRules: {
                attr_name: [{ required: true, message: '请输入分配名称', trigger: 'blur' }],
                attr_vals: [{ message: '请输入分配名称,以逗号分隔', trigger: 'blur' }],
            },
            editDialogVisible: false,
            editParamsForm: {},
            editFormRules: {
                attr_name: [{ required: true, message: '请输入分配名称', trigger: 'blur' }],
                attr_vals: [{ message: '请输入分配名称以逗号分隔', trigger: 'blur' }],
            },
        }
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.totalPage = res.data.total
            this.cateList = res.data
        },
        handleChange(val) {
            if (val.length === 3) {
                return this.getParamsList()
            }
            this.ParamsList = []
        },
        handleState(key) {
            if (key === '1') {
                this.pageState = 'many'
                this.handleChange(this.currentVal)
            } else {
                this.pageState = 'only'
                this.handleChange(this.currentVal)
            }
        },
        async getParamsList() {
            this.ParamsList = []
            const { data: res } = await this.$http.get(`categories/${this.currentVal[2]}/attributes`, {
                params: {
                    sel: this.pageState,
                },
            })
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            if (res.data.length === 0) {
                res.data = [...res.data, { attr_vals: [] }]
            }
            res.data.forEach((val) => {
                val.attr_vals = val.attr_vals.length > 0 ? val.attr_vals.split(',') : []
            })
            this.ParamsList = res.data
        },
        handleClose(row, i) {
            row.attr_vals.splice(i, 1)
        },
        showInput(row) {
            this.inputVisible = true
            this.$nextTick(() => {
                this.$refs.saveTagInput.$refs.input.focus()
            })
        },

        handleInputConfirm(row) {
            const currentIndex = this.ParamsList.indexOf(row)
            if (this.inputValue) {
                row.attr_vals = [...row.attr_vals, this.inputValue]
                this.ParamsList[currentIndex].attr_vals = row.attr_vals
            }
            this.inputVisible = false
            this.inputValue = ''
        },
        // 使表格的expand每次只展开一个,解决taginput不集中问题
        getRowKeys(row) {
            return row.attr_id
        },
        handleRow(row, expandedRows) {
            if (expandedRows.length) {
                this.expands = []
                if (row) {
                    this.expands = [...this.expands, row.attr_id]
                }
            } else {
                this.expands = []
            }
        },
        // 添加
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
        },
        addParams() {
            this.$refs.addFormRef.validate(async (valid) => {
                if (!valid) return false
                const { data: res } = await this.$http.post(`categories/${this.currentVal[2]}/attributes`, {
                    attr_name: this.addParamsForm.attr_name,
                    attr_sel: this.pageState,
                    attr_vals: this.addParamsForm.attr_vals,
                })
                if (res.meta.status !== 201) return this.$messsage.error('获取数据失败')
                this.addDialogVisible = false
                this.getParamsList()
            })
        },
        // 编辑
        async editDialogUser(row) {
            this.editDialogVisible = true
            if (row.attr_sel === 'many') {
                const { data: res } = await this.$http.get(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(','),
                })
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.editParamsForm = res.data
            } else {
                const { data: res } = await this.$http.get(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
                    attr_sel: row.attr_sel,
                })
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.editParamsForm = res.data
            }
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
        },
        editParams() {
            this.$refs.editFormRef.validate(async (valid) => {
                if (!valid) return false
                const { data: res } = await this.$http.put(`categories/${this.currentVal[2]}/attributes/${this.editParamsForm.attr_id}`, {
                    attr_name: this.editParamsForm.attr_name,
                    attr_sel: this.pageState,
                    attr_vals: this.editParamsForm.attr_vals,
                })
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.editDialogVisible = false
                this.getParamsList()
            })
        },
        // 删除
        async deleteDialog(row) {
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
            const { data: res } = await this.$http.delete(`categories/${row.cat_id}/attributes/${row.attr_id}`)
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.getParamsList()
        },
    },
    computed: {
        cateId() {
            if (this.currentVal.length === 3) {
                return this.currentVal[2]
            }
            return null
        },
        isactive() {
            if (this.currentVal.length === 3) {
                return false
            }
            return true
        },
    },
    created() {
        this.getCateList()
    },
}
</script>

<style lang="less" scoped>
.cas_content {
    margin-top: 5px;
    font-size: 14px;
}
.el-menu-container {
    margin-bottom: 5px;
}
.addBtn {
    margin-bottom: 5px;
}
.el-tag {
    margin: 10px;
}
.newTagIpt {
    width: 20%;
}
</style>
