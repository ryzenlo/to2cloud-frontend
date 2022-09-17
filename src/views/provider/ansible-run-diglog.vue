<template>
    <div>
   <el-dialog
      title="Ansible Logs"
      :visible.sync="diglogVisibleOfTable"
      destroy-on-close
    >
          <el-button type="primary" size="small" @click="showRunDialog">Run Playbook</el-button>
          <el-table :data="logs" style="width: 100%">
            <el-table-column prop="id" label="ID" width="60">
            </el-table-column>

            <el-table-column prop="ansible_playbook_name" label="Playbook Name" width="180">
            </el-table-column>

            <el-table-column prop="status" label="Status" width="100">
            </el-table-column>

            <el-table-column
              prop="created_at"
              label="Created At"
              width="180"
              :formatter="timestampFormatter"
            >
            </el-table-column>

            <el-table-column
              prop="updated_at"
              label="Updated At"
              width="180"
              :formatter="timestampFormatter"
            >
            </el-table-column>

            <el-table-column label="Operation">
              <template slot-scope="scope">
               <el-button
                         @click.native.prevent="showViewDialog(scope.$index,scope.row)"
                         type="primary"
                         size="small"
               >
                 Detail
               </el-button>
              </template>
            </el-table-column>
          </el-table>
    </el-dialog>
    <el-dialog
      title="Run Ansible"
      :visible.sync="diglogVisible"
      destroy-on-close
    >
      <el-form
        ref="form"
        :model="runForm"
        label-width="140px"
      >
        <el-form-item label="Server IP" prop="ip">
          <el-input v-model="runForm.ip" style="width:120px" readonly>
          </el-input>
          <el-button style="margin-left:20px" type="primary" :loading="IPchecking" @click="checkServerIPReachable" size="small">Ping IP</el-button>
        </el-form-item>
        <el-form-item label="RSA Key(SSH)">
          <el-select v-model="runForm.rsa_key_id" readonly>
            <el-option
              v-for="item in RSAKeys4SSH"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
          <el-button type="primary" size="small" style="margin-left:20px" :loading="sshChecking" @click="checkSSHReachable">Check SSH Connetion</el-button>
        </el-form-item>
        <el-form-item label="PlayBook">
          <el-select v-model="runForm.playbook_name">
            <el-option
              v-for="item in playbooks"
              :key="item.filename"
              :label="item.filename"
              :value="item.filename"
            ></el-option>            
          </el-select>

          <el-button type="primary" size="small" style="margin-left:20px" @click="showPlaybookContent">View</el-button>
        </el-form-item>

        <el-form-item label="Use Proxy">
            <el-radio v-model="runForm.use_proxy" label="true">Yes</el-radio>
            <el-radio v-model="runForm.use_proxy" label="false">No</el-radio>
        </el-form-item>

        <template v-if="runForm.use_proxy == 'true'"> 
            <el-form-item label="Proxy Type">
                <el-select v-model="runForm.proxy_type">
                  <el-option
                    v-for="item in proxyTypes"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  ></el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="Proxy Host">
              <el-input v-model="runForm.proxy_host" style="width:180px"></el-input>
            </el-form-item>

            <el-form-item label="Proxy Port">
                <el-input v-model="runForm.proxy_port" style="width:180px"></el-input>
            </el-form-item>
        </template>

        <el-form-item>
          <el-button type="primary" @click="runAnsiblePlayBook">Run</el-button>
          <el-button @click="diglogVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog
      title="Playbook Content"
      :visible.sync="diglogVisibleOfPlaybook"
      destroy-on-close
    >
      <div style="margin: 0 20px">
        <codemirror v-model="fileContent" :options="cmOptions"></codemirror>
      </div>
    </el-dialog>

    <el-dialog
      title="Log Detail"
      :visible.sync="diglogVisibleOfDetail"
      destroy-on-close
    >
      <el-form
        ref="form2"
        :model="log"
        label-width="180px"
      >

        <el-form-item label="Playbook Name">
          <el-input v-model="log.ansible_playbook_name" style="width:240px" readonly></el-input>
        </el-form-item>

        <el-form-item label="Playbook Content">
          <el-input type="textarea" v-model="log.ansible_playbook_content" readonly></el-input>
        </el-form-item>

        <el-form-item label="Host Config Content">
          <el-input type="textarea" v-model="log.ansible_host_config" readonly></el-input>
        </el-form-item>

        <el-form-item label="Extra Variables">
          <el-input type="textarea" v-model="log.ansible_extra_variables"  readonly></el-input>
        </el-form-item>

        <el-form-item label="Playbook Command">
          <el-input type="textarea" v-model="log.play_cmd" readonly></el-input>
        </el-form-item>

        <el-form-item label="Command Result">
          <el-input type="textarea" v-model="log.play_result" readonly></el-input>
        </el-form-item>

      </el-form>


    </el-dialog>


    </div>
</template>
<script>
import moment from 'moment'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/yaml/yaml.js'
import 'codemirror/theme/base16-light.css'
import { getLocalVPS,runAnsiblePlaybookOnVultr, getAnsibleOpsLogs } from "@/api/cloud_provider";
import { getPlaybooks,getPlaybookContent,pingIP,checkSSHConnection } from "@/api/ansible_plabook"
export default {
    components:{
       codemirror
    },
    data() {
       return {
          name:"AnsibleRunPanel",
          diglogVisible:false,
          diglogVisibleOfTable:true,
          diglogVisibleOfDetail:false,
          diglogVisibleOfPlaybook:false,
          IPchecking:false,
          sshChecking:false,
          runForm:{ip:"",playbook_name:"",rsa_key_id:"",use_proxy:"false"},
          fileContent:"",
          cmOptions:{ 
            tabSize: 4,
            mode: 'text/yaml',
            theme: 'base16-light',
            line: true,
          },
          RSAKeys4SSH:[],
          playbooks:[],
          logs:[],
          log:{},
          proxyTypes:[{name:"Socks5",value:"socks5"}, {name:"Http",value:"Http"}, {name:"Https",value:"https"}]
       }
    },
    created() {
       this.runForm.ip = this.vultrInstance.main_ip;
       this.RSAKeys4SSH = this.RSAKeys.filter(item => item.type == 0)
       //
       getAnsibleOpsLogs(this.vultrCloudProvider.id, this.vultrInstance.id).then((response) => {
           this.logs = response.data
           console.log(this.logs);
       })
       getPlaybooks().then((response) => {
            if (Array.isArray(response.data)) {
                response.data.forEach((item,index) => {
                    item.id = index;
                    this.playbooks.push(item);
                })
            }
       })
       getLocalVPS(this.vultrCloudProvider.id, this.vultrInstance.id).then((response) => {
          if (response.code != 0) {
              this.runForm.rsa_key_id = 3;
              return
          }
          this.runForm.rsa_key_id = response.data.local_rsa_key_id;
       })
    },
    props:['RSAKeys','vultrInstance','vultrCloudProvider'],
    watch:{
       diglogVisibleOfTable() {
           this.$emit('closeAnsibleRunPanel');
       }
    },
    methods:{
      checkServerIPReachable() {
          this.IPchecking = true;
          pingIP(this.runForm.ip).then((response) => {
              this.IPchecking = false;
              const res = response.data;
              if (res.code != 0) {
                 this.$message.error(res.msg);   
                 return
              }
              if (res.data.PacketLoss == 100) { 
                  let errMsg = "Pinging " + this.runForm.ip + " failed!";
                  this.$message.error(errMsg);
                  return
              }
              this.$message({
                message: "Pinging " + this.runForm.ip + " succeed!",
                type: "success",
              });
          })
      },
      checkSSHReachable() {
          if (this.runForm.rsa_key_id == "") {
              this.$message({
                message: "Please select a RSA key",
                type: "warning",
              });
              return
          }
          this.sshChecking = true;
          let selectedKeys = this.RSAKeys.filter(item => item.id == this.runForm.rsa_key_id)
          let PostData = {
             username:'root',
             port:'22',
             ip:this.runForm.ip,
             rsa_private_key:selectedKeys[0].private_key
          }
          checkSSHConnection(PostData).then((response) => {
              const res = response.data
              if (res.code != 0) {
                 this.$message.error(res.msg);
                 this.sshChecking = false;
                 return
              }
              this.sshChecking = false;
              this.$message({
                message: "success!",
                type: "success",
              });
          })
      },
      showRunDialog() {
         this.diglogVisible = true;
      },
      showViewDialog(index, row) {
         this.diglogVisibleOfDetail = true;
         this.log = row;
      },
      showPlaybookContent() {
          if (this.runForm.playbook_name == '') {
              this.$message({
                message: "Please select a playbook",
                type: "warning",
              });
              return
          }
          getPlaybookContent(this.runForm.playbook_name).then((response) => {
              this.fileContent = response.data;
              this.diglogVisibleOfPlaybook = true;
          })
      },
      runAnsiblePlayBook() {
          let use_proxy = false;
          if (this.runForm.use_proxy == 'true') {
            use_proxy = true
          }
          let postData = {
             playbook_name:this.runForm.playbook_name,
             proxy_config:{
                "use_proxy": use_proxy,
                "proxy_type":this.runForm.proxy_type,
                "proxy_host":this.runForm.proxy_host,
                "proxy_port":this.runForm.proxy_port,
             }
          }
          runAnsiblePlaybookOnVultr(this.vultrCloudProvider.id, this.vultrInstance.id, postData).then((response) => {
              const res = response.data
              if (res.code != 0) {
                 this.$message.error(res.msg);
                 return
              }
              this.$message({
                message: "success!",
                type: "success",
              });
              //
              this.diglogVisible = false;
              //reload util done.
              this.reloadOpsLogsUntilDone();
          })
      },
      timestampFormatter(row) {
          let readable = moment.unix(row.created_at).format('YYYY-MM-DD HH:mm:ss');
          return readable;
      },
      reloadOpsLogsUntilDone() {
          getAnsibleOpsLogs(this.vultrCloudProvider.id, this.vultrInstance.id).then((response) => {
                    this.logs = response.data
                    return true;
          }).then((response) => {
               if (!response) {
                   console.log("no logs yet.")
                   return
               }
               let hasRunningTask = false;
               this.logs.forEach(item => {
                     if (item.status != 'done') {
                         hasRunningTask = true
                     }
               })
               if (hasRunningTask) {
                  //reload util all vps have main ip 
                  setTimeout(() => {this.reloadOpsLogsUntilDone()}, 5000)
               }
          });
      }
    },
}
</script>