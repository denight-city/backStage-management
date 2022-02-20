<template>
    <div id="oders">
        <bread :breadList="breadList"></bread>
        <el-card>
            <!-- 搜索区 -->
            <el-row :gutter="20">
                <el-col :span="10">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 表格区 -->
            <el-table :data="orderList" border stripe>
                <el-table-column type="index"> </el-table-column>
                <el-table-column prop="order_number" label="订单编号"> </el-table-column>
                <el-table-column prop="order_price" label="订单价格" width="150px"> </el-table-column>
                <el-table-column prop="pay_status" label="是否付款" width="150px">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_status === '0'">未付款</el-tag>
                        <el-tag v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货" width="150px"> </el-table-column>
                <el-table-column prop="create_time" label="创建时间" width="200px">
                    <template slot-scope="scope"> {{ scope.row.create_time | dateFormat }}</template>
                </el-table-column>
                <el-table-column label="状态" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDialogUser(scope.row.order_id)"></el-button>
                        <el-button type="danger" icon="el-icon-location" size="mini" @click="dliverDialog(scope.row.order_id)"></el-button>
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
                :total="total"
            >
            </el-pagination>
        </el-card>

        <!-- 编辑区 -->
        <el-dialog title="编辑订单" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form ref="editRef" :model="editForm" :rules="editRules" label-width="100px">
                <el-form-item label="是否发货" prop="is_send">
                    <el-radio v-model="editForm.is_send" label="是">是</el-radio>
                    <el-radio v-model="editForm.is_send" label="否">否</el-radio>
                </el-form-item>
                <el-form-item label="订单支付" prop="order_pay">
                    <el-radio v-model="editForm.order_pay" label="0">未支付</el-radio>
                    <el-radio v-model="editForm.order_pay" label="1">支付宝</el-radio>
                    <el-radio v-model="editForm.order_pay" label="2">微信</el-radio>
                    <el-radio v-model="editForm.order_pay" label="3">银行卡</el-radio>
                </el-form-item>
                <el-form-item label="订单价格" prop="order_price">
                    <el-input v-model.number="editForm.order_price"></el-input>
                </el-form-item>
                <el-form-item label="订单编号" prop="order_number">
                    <el-input v-model="editForm.order_number"></el-input>
                </el-form-item>
                <el-form-item label="支付状态" prop="pay_status">
                    <el-radio v-model="editForm.pay_status" label="1">是</el-radio>
                    <el-radio v-model="editForm.pay_status" label="0">否</el-radio>
                </el-form-item>
                <el-form-item label="省市区/县" prop="consignee_addr">
                    <el-cascader :props="cityProps" v-model="editForm.consignee_addr" :options="cityList" @change="handleChange" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <div slot="footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editOrder">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 查看物流区 -->
        <el-dialog title="查看物流" :visible.sync="dliverDialogVisible" width="50%" @click="dliverDialogClosed">
            <el-timeline :reverse="false">
                <el-timeline-item v-for="(item, index) in dliverList" :key="index" :timestamp="item.time">
                    {{ item.context }}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import cityList from './cities.js'
import bread from '../../components/bread/index.vue'
export default {
    name: 'orders',
    components: { bread },
    data() {
        return {
            breadList: ['订单管理', '订单列表'],
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 5,
                user_id: '',
                pay_status: '',
                is_send: '',
                order_fapiao_title: '',
                order_fapiao_company: '',
                order_fapiao_content: '',
                consignee_addr: '',
            },
            orderList: [],
            total: 0,
            editDialogVisible: false,
            editForm: {},
            editRules: {
                is_send: [{ required: true, message: '请至少选择一个活动性质', trigger: 'change' }],
                order_pay: [{ required: true, message: '请至少选择一个活动性质', trigger: 'change' }],
                order_price: [{ required: true, message: '请输入订单价格', trigger: 'blur' }],
                order_number: [{ required: true, message: '请输入订单数量', trigger: 'blur' }],
                order_status: [{ required: true, message: '请至少选择一个活动性质', trigger: 'change' }],
                consignee_addr: [{ required: true, message: '请至少选择地址', trigger: 'change' }],
            },
            cityProps: { expandTrigger: 'hover', value: 'value', label: 'label', children: 'children' },
            cityList: cityList,
            dliverDialogVisible: false,
            dliverList: [],
        }
    },
    methods: {
        async getOrderList() {
            const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.total = res.data.total
            this.orderList = res.data.goods
        },
        handleSizeChange(val) {
            this.queryInfo.pagesize = val
            this.getOrderList()
        },
        handleCurrentChange(val) {
            this.queryInfo.pagenum = val
            this.getOrderList()
        },
        // 编辑区
        async editDialogUser(id) {
            this.editDialogVisible = true
            const { data: res } = await this.$http.get(`orders/${id}`)
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.editForm = res.data
        },
        editDialogClosed() {
            this.$refs.editRef.resetFields()
        },
        handleChange(val) {
            this.editForm.consignee_addr = val
        },
        editOrder() {
            this.$refs.editRef.validate(async (valid) => {
                if (!valid) return
                this.editDialogVisible = false
                this.editForm.consignee_addr = this.editForm.consignee_addr.join('')
                const form = this._.cloneDeep(this.editForm)
                const { data: res } = await this.$http.put(`orders/${form.order_id}`, form)
                if (res.meta.status !== 201) return this.$message.error('获取数据失败')
                this.getOrderList()
            })
        },
        // 查看物流区
        async dliverDialog(id) {
            this.dliverDialogVisible = true
            const { data: res } = await this.$http.get('kuaidi/1106975712662')
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.dliverList = res.data
        },
        dliverDialogClosed() {
            this.dliverList = []
        },
    },
    created() {
        this.getOrderList()
    },
}
</script>

<style lang="less" scoped>
.el-timeline {
    overflow: auto;
    height: 300px;
}
</style>
