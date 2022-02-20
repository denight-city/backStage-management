import Vue from 'vue'
import VueRouter from 'vue-router'
const Login = () => import( /* webpackChunkName: "login" */ '../view/Login.vue')
const Home = () => import( /* webpackChunkName: "home" */ '../view/Home.vue')
const Users = () => import( /* webpackChunkName: "user_Users" */ '../view/user/Users.vue')
const Rights = () => import( /* webpackChunkName: "right_Right" */ '../view/right/Rights.vue');
const Roles = () => import( /* webpackChunkName: "right_Role" */ '../view/right/Roles.vue');
const Params = () => import( /* webpackChunkName: "goods_Params" */ '../view/goods/Params.vue');
const Categories = () => import( /* webpackChunkName: "goods_Categories" */ '../view/goods/Categories.vue');
const Goods = () => import( /* webpackChunkName: "goods_Goods" */ '../view/goods/Goods.vue');
const Add = () => import( /* webpackChunkName: "goods_Goods_Add" */ '../view/goods/Add.vue');
const Orders = () => import( /* webpackChunkName: "Order_Orders" */ '../view/order/Orders.vue');
const Reports = () => import( /* webpackChunkName: "report_Reports" */ '../view/report/Reports.vue')
Vue.use(VueRouter)
const routes = [

  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '',
    redirect: '/login'
  }, {
    path: '/login',
    component: Login
  }, {
    path: '/home',
    component: Home,
    redirect: '/users',
    children: [{
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/categories',
        component: Categories
      },
      {
        path: '/goods',
        component: Goods
      }, {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Orders
      },
      {
        path: '/reports',
        component: Reports
      }
    ]
  }

]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})
// 路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
