<template>
    <div id="rights">
        <bread :breadList="breadList"></bread>

        <el-table :data="rightList" border stripe>
            <el-table-column type="index"> </el-table-column>
            <el-table-column prop="authName" label="权限名称"> </el-table-column>
            <el-table-column prop="path" label="权限路径"> </el-table-column>
            <el-table-column prop="level" label="权限等级">
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                    <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
                    <el-tag type="warning" v-else>三级</el-tag>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import bread from '../../components/bread/index.vue'
export default {
    name: 'rights',
    components: { bread },
    data() {
        return {
            rightList: [],
            breadList: ['权限管理', '权限列表'],
        }
    },
    methods: {
        async getRightList() {
            const { data: res } = await this.$http.get('rights/list')
            if (res.meta.status !== 200) return this.$message.error('获取数据失败')
            this.rightList = res.data
        },
    },
    created() {
        this.getRightList()
    },
}
</script>

<style lang="" scoped></style>
