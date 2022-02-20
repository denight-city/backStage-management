<template>
    <div id="goods">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 搜索区 -->
            <el-row :gutter="20">
                <el-col :span="10">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <!-- 用户添加 -->
                    <el-button type="primary" @click="goAdd">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 表格区 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index"> </el-table-column>
                <el-table-column prop="goods_name" label="商品名称"> </el-table-column>
                <el-table-column prop="goods_price" label="价格" width="100px"> </el-table-column>
                <el-table-column prop="goods_weight" label="商品重量" width="100px"> </el-table-column>
                <el-table-column label="创建时间" width="160px">
                    <template slot-scope="scope"> {{ scope.row.add_time | dateFormat }}</template>
                </el-table-column>
                <el-table-column label="状态" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialogUser(scope.row)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDialog(scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="totalPage"
            >
            </el-pagination>
        </el-card>

        <!-- 编辑商品区 -->
        <el-dialog title="编辑商品" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
                <el-form-item label="商品名" prop="goods_name">
                    <el-input v-model="editForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格" prop="goods_price">
                    <el-input type="number" v-model="editForm.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                    <el-input type="number" v-model="editForm.goods_number"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input type="number" v-model="editForm.goods_weight"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editGoods">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    name: 'goods',
    data() {
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 5,
            },
            totalPage: 0,
            goodsList: [],
            editDialogVisible: false,
            editForm: {},
            editFormRules: {
                goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
                goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
                goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
                goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
            },
        }
    },
    methods: {
        async getGoodsList() {
            const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.goodsList = res.data.goods
            this.totalPage = res.data.total
        },
        handleCurrentChange(val) {
            this.queryInfo.pagenum = val
            this.getGoodsList()
        },
        handleSizeChange(val) {
            this.queryInfo.pagesize = val
            this.getGoodsList()
        },
        async editDialogUser(row) {
            this.editDialogVisible = true
            const { data: res } = await this.$http.get(`goods/${row.goods_id}`)
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.editForm = res.data
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()
            this.getGoodsList()
        },
        editGoods() {
            this.$refs.editFormRef.validate(async (valid) => {
                if (!valid) return
                this.editDialogVisible = false
                // console.log editForm没有值可能是复杂数据类型无法简单更改
                const form = _.cloneDeep(this.editForm)
                const { data: res } = await this.$http.put(`goods/${form.goods_id}`, {
                    goods_name: form.goods_name,
                    goods_price: form.goods_price,
                    goods_number: form.goods_number,
                    // 原文档缺少goods_cat导致数据无法添加
                    goods_cat: form.goods_cat,
                    goods_weight: form.goods_weight,
                    goods_introduce: form.goods_introduce,
                    pics: form.pics,
                    attrs: form.attrs,
                })
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.getGoodsList()
            })
        },
        async deleteDialog(row) {
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
                const { data: res } = await this.$http.delete(`goods/${row.goods_id}`)
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.getGoodsList()
            } catch (err) {
                if (err === 'cancel') {
                    this.$message({
                        type: 'info',
                        message: '已取消删除',
                    })
                }
            }
        },
        // 路由跳转
        goAdd() {
            this.$router.push('/goods/add')
        },
    },
    created() {
        this.getGoodsList()
    },
}
</script>

<style lang="less" scoped></style>
