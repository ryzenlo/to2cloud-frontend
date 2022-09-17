<template>
  <div class="container">
    <div style="font-size: 20px; margin-bottom: 18px">Key List</div>
        <div v-if="keyList.length == 0" class="empty-list" >
          <el-button type="primary" @click.native.prevent="showCreateDialog()">Add Key</el-button>
        </div>
        <template v-else>
        <el-button type="primary" size="small" @click.native.prevent="showCreateDialog()">Add Key</el-button>
        <el-table :data="keyList" style="width: 100%">
            <el-table-column prop="id" label="ID" width="300">
            </el-table-column>

            <el-table-column prop="type" label="Type" width="180" :formatter="typeFormatter">
            </el-table-column>

            <el-table-column prop="name" label="Name" width="180">
            </el-table-column>

            <el-table-column
              prop="date_created"
              label="Created At"
              width="200"
              :formatter="dateFormatter"
            >
            </el-table-column>  
            <el-table-column label="Operation">
              <template slot-scope="scope">
               <el-button
                         @click.native.prevent="deleteKey(scope.$index,scope.row)"
                         type="danger"
                         size="small"
               >
                 Delete
               </el-button>
              </template>
              </el-table-column>
          </el-table>
        </template>
    <!-- dialog -->

    <el-dialog
      title="Add a Key Pair"
      :visible.sync="dialogVisible"
      destroy-on-close
    >
      <el-form
        ref="form"
        :model="keyForm"
        :rules="rules"
        label-width="160px"
      >
        <el-form-item label="Type">
          <el-select v-model="keyForm.type" @change="typeHandler()">
            <el-option
              v-for="item in types"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="Name" prop="name">
          <el-input v-model="keyForm.name"></el-input>
        </el-form-item>

        <el-form-item label="Key bits" prop="key_bits">
          <el-input v-model="keyForm.key_bits" readonly></el-input>
        </el-form-item>

        <template v-if="displayCSRParam">
            <el-form-item label="Email" prop="email">
              <el-input v-model="keyForm.csr_params.email"></el-input>
            </el-form-item>
    
            <el-form-item label="Common Name" prop="common_name">
              <el-input v-model="keyForm.csr_params.common_name"></el-input>
            </el-form-item>
            
            <el-form-item label="Country" prop="country">
              <el-input v-model="keyForm.csr_params.country"></el-input>
            </el-form-item>

            <el-form-item label="Province" prop="province">
              <el-input v-model="keyForm.csr_params.province"></el-input>
            </el-form-item>

            <el-form-item label="Locality" prop="locality">
              <el-input v-model="keyForm.csr_params.locality"></el-input>
            </el-form-item>

            <el-form-item label="Organization" prop="organization">
              <el-input v-model="keyForm.csr_params.organization"></el-input>
            </el-form-item>

            <el-form-item label="Organizational Unit" prop="organizational_unit">
              <el-input v-model="keyForm.csr_params.organizational_unit"></el-input>
            </el-form-item>
        </template>
        
        <el-form-item>
          <el-button type="primary" @click="submit">Confirm</el-button>
          <el-button @click="dialogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>
<script>
import moment from 'moment'
import {
  getRSAKeys,
  createRSAKey,
  delRSAKey,
} from "@/api/rsa_keys";
export default {
  name: "keys",
  data() {
    return {
      dialogVisible: false,
      displayCSRParam:false,
      keyForm:{
          key_bits:2048,
          type:0,
          csr_params:{}
      },
      keyList:[],
      types: [
        {name:"SSH",value:0},
        {name:"CSR",value:1}
      ],
      csrMeta:{
            email:"mail@example.com",
            common_name:"example.com",
            country:"US",
            province:"CA",
            locality:"City",
            organization:"Company Ltd",
            organizational_unit:"IT",
      },
      rules: {
        name: [
          {
            required: true,
            message: "Please type in unique name",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    getRSAKeys({}).then((response) => {
         if (response.code != 0) {
            return;
         }
         this.keyList = response.data
    })
  },
  methods: {
    showCreateDialog() {
      this.dialogVisible = true;
      this.keyForm.csr_params = Object.assign({}, this.csrMeta);
    },
    typeHandler(){
       if (this.keyForm.type != '0') {
           this.displayCSRParam = true;
           return;
       }
       this.displayCSRParam = false;
    },
    submit() {
      this.$refs['form'].validate((valid) => {
        if (!valid) {
           return false;
        }
        let postData = this.keyForm;
        createRSAKey(postData).then((response) => {
            this.$message({
              message: "Success",
              type: "success",
            });
            this.dialogVisible = false;
            this.$router.go();
        });
      });
    },
    dateFormatter(row) {
      let readable = moment(row.date_created).format('YYYY-MM-DD HH:mm:ss');
      return readable;
    },
    typeFormatter(row) {
      if (row.type == 1) {
        return "CSR";
      }
      return "SSH";
    },
    deleteKey(index, row) {
        this.$confirm('Are you sure to delete ?', 'Tip', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          delRSAKey(row.id).then((response) => {
              this.$message({
                message: "Success",
                type: "success",
              });
              this.$router.go();
          });
        });
    }
  },
};
</script>
<style scoped>
.container {
  margin: 30px;
}

.empty-list {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 800px;
  height: 400px;
  margin: 50px auto;
  border: 1px solid #dcdfe6;
}
.api-status {}
</style>