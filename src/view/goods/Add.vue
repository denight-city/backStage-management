<template>
    <div id="add">
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"> </el-alert>
            <el-steps space="180px" :active="active - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form ref="addRef" :model="addGoodsForm" :rules="addRules" label-position="top" label-width="100px">
                <el-tabs tab-position="left" v-model="active" :before-leave="beforeLeave">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label=" 商品名称" prop="goods_name">
                            <el-input v-model="addGoodsForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input type="number" v-model="addGoodsForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input type="number" v-model="addGoodsForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input type="number" v-model="addGoodsForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader :props="cateProps" v-model="addGoodsForm.goods_cat" :options="cateList" @change="handleChange" clearable></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_vals.length !== 0 ? item.attr_name : ''" v-for="item in manyList" :key="item.attr_id">
                            <!-- v-model要绑定空数组,不然取消勾选后会消失-->
                            <el-checkbox-group v-model="checkBox">
                                <el-checkbox :label="item1" v-for="item1 in item.attr_vals" :key="item1" border>{{ item1 }}</el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyList" :key="item.attr_id">
                            <el-input v-model="item.attr_vals" style="width: 70%"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-form-item prop="pics">
                            <el-upload :action="picUrl" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" list-type="picture" :headers="uploadHeader">
                                <el-button size="small" type="primary">点击上传</el-button>
                            </el-upload>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
                        <el-button class="quill_btn" size="small" type="primary" @click="addGoods">点击添加</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览 -->
        <el-dialog title="图片预览" :visible.sync="preDialogVisible" width="50%" @close="preDialogClosed">
            <img src="previewUrl" alt="#" class="preView" />
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    name: 'add',
    data() {
        return {
            active: 0,
            addGoodsForm: {
                goods_name: '',
                goods_price: '',
                goods_weight: '',
                goods_number: '',
                goods_cat: [],
                pics: [],
                goods_introduce: '',
                attrs: [],
            },
            addRules: {
                goods_name: [{ required: true, message: '请填写商品名称', trigger: 'blur' }],
                goods_price: [{ required: true, message: '请填写商品价格', trigger: 'blur' }],
                goods_weight: [{ message: '请填写商品重量', trigger: 'blur' }],
                goods_number: [{ required: true, message: '请填写商品数量', trigger: 'blur' }],
                goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }],
            },
            cateProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
            },
            cateList: [],
            manyList: [],
            onlyList: [],
            checkBox: [],
            picUrl: 'https://lianghj.top:8888/api/private/v1/upload',
            uploadHeader: { Authorization: window.sessionStorage.getItem('token') },
            preDialogVisible: false,
            previewUrl: '',
        }
    },
    methods: {
        // 层级选择器数据
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
            this.cateList = res.data
        },
        // 获取动态
        async getManyList() {
            const { data: res } = await this.$http.get(`categories/${this.addGoodsForm.goods_cat[2]}/attributes`, {
                params: {
                    sel: 'many',
                },
            })
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            if (res.data.length === 0) {
                res.data = [...res.data, { attr_vals: [] }]
            }
            res.data.forEach((val) => {
                val.attr_vals = val.attr_vals.length > 0 ? val.attr_vals.split(',') : []
            })
            this.manyList = res.data
        },
        // 静态属性
        async getOnlyList() {
            const { data: res } = await this.$http.get(`categories/${this.addGoodsForm.goods_cat[2]}/attributes`, {
                params: {
                    sel: 'only',
                },
            })
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            if (res.data.length === 0) {
                res.data = [...res.data, { attr_vals: [] }]
            }
            this.onlyList = res.data
        },
        beforeLeave(act, old) {
            if (old === '0' && this.addGoodsForm.goods_cat.length !== 3) {
                return false
            } else if (act === '1') {
                this.getManyList()
            } else if (act === '2') {
                this.getOnlyList()
            }
        },
        // 层级选择器绑定数组
        handleChange(val) {
            if (val.length !== 3) {
                this.addGoodsForm.goods_cat = []
            }
        },
        // 图片上传区
        handlePreview(file) {
            this.preDialogVisible = true
            this.previewUrl = file.response.data.url
        },
        preDialogClosed() {
            this.previewUrl = ''
        },
        handleSuccess(respond, file, fileList) {
            if (respond.meta.status !== 200) {
                this.$message({
                    type: 'warning',
                    message: '上传失败',
                })
            } else {
                this.addGoodsForm.pics = [...this.addGoodsForm.pics, respond.data.tmp_path]
            }
        },
        handleRemove(file) {
            var i = this.addGoodsForm.pics.findIndex((item) => {
                return item === file.response.data.tmp_path
            })
            this.addGoodsForm.pics.splice(i, 1)
        },
        addGoods() {
            this.$refs.addRef.validate(async (valid) => {
                if (!valid) return
                this.editDialogVisible = false
                // console.log editForm没有值可能是复杂数据类型无法简单更改
                const form = _.cloneDeep(this.addGoodsForm)
                form.goods_cat = form.goods_cat.join(',')
                form.attrs = [...this.manyList, ...this.onlyList]
                console.log(form)
                const { data: res } = await this.$http.post('goods', {
                    goods_name: form.goods_name,
                    goods_cat: form.goods_cat,
                    goods_price: form.goods_price,
                    goods_number: form.goods_number,
                    goods_weight: form.goods_weight,
                    goods_introduce: form.goods_introduce,
                    pics: form.pics,
                    attrs: form.attrs,
                })
                if (res.meta.status !== 200) return this.$messsage.error('获取数据失败')
                this.$routre.push('/goods')
            })
        },
    },
    created() {
        this.getCateList()
    },
}
</script>

<style lang="less" scoped>
.el-steps {
    margin-top: 5px;
}
.el-tabs {
    margin-top: 20px;
}
.el-tab-pane {
    padding-left: 20px;
}
.preView {
    width: 100%;
}

button.el-button.quill_btn.el-button--primary.el-button--small {
    margin-top: 10px;
}
</style>
