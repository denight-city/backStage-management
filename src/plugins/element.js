import vue from 'vue'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import TreeTable from 'vue-table-with-tree-grid'
import {
  Button,
  Form,
  FormItem,
  Input,
  Message,
  MessageBox,
  Container,
  Header,
  Aside,
  Menu,
  Submenu,
  MenuItemGroup,
  MenuItem,
  Main,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Table,
  TableColumn,
  Pagination,
  Icon,
  Row,
  Col,
  Switch,
  Dialog,
  Tooltip,
  Select,
  Option,
  Tag,
  Tree,
  Alert,
  Cascader,
  Steps,
  Step,
  Tabs,
  TabPane,
  CheckboxGroup,
  Checkbox,
  Upload,
  Radio,
  Timeline,
  TimelineItem
} from 'element-ui'

vue.use(Button)
vue.use(Form)
vue.use(FormItem)
vue.use(Input)
vue.use(Container)
vue.use(Header)
vue.use(Aside)
vue.use(Menu)
vue.use(Submenu)
vue.use(MenuItemGroup)
vue.use(MenuItem)
vue.use(Main)
vue.use(Breadcrumb)
vue.use(BreadcrumbItem)
vue.use(Card)
vue.use(Table)
vue.use(TableColumn)
vue.use(Pagination)
vue.use(Icon)
vue.use(Row)
vue.use(Col)
vue.use(Switch)
vue.use(Dialog)
vue.use(Tooltip)
vue.use(Select)
vue.use(Option)
vue.use(Tag)
vue.use(Tree)
vue.use(Alert)
vue.use(Cascader)
vue.use(Steps)
vue.use(Step)
vue.use(Tabs)
vue.use(TabPane)
vue.use(Checkbox)
vue.use(CheckboxGroup)
vue.use(Upload)
vue.use(Radio)
vue.use(Timeline)
vue.use(TimelineItem)
vue.use(VueQuillEditor)
vue.component('tree-table', TreeTable)
vue.prototype.$message = Message
vue.prototype.$confirm = MessageBox.confirm
