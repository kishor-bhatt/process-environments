import { Component,OnInit  } from '@angular/core';
import { DataService } from './dataservice';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'process env';
  processes;
  selectedProcessName;
  addNew = false;
  showInfo = false;
  processInfo = {}; 
  processInfoPrev = {}; 
  newProcessInfo = { 'PROCESS_NAME':'', 'DATABASE_HOST':'','DATABASE_PASSWORD':'','QUEUE_CONNECTION_STRING':''};

  constructor(private dataservice:DataService){  }

  ngOnInit(){
    this.listAllProcesses();
  }

  listAllProcesses(){
    this.dataservice.getAllProcess().subscribe(data => {
      this.processes = data;
    },
    error => { 
      console.log('error:'+JSON.stringify(error)); 
    });
  }

  getProcessInfo(processName) {
    this.showInfo = true;
    this.dataservice.getProcessInfo(processName).subscribe(data => {
      this.processInfo = data;
      this.selectedProcessName = processName;

      let keys = Object.keys(data);
      for(let i=0;i<keys.length;i++){
        this.processInfoPrev[keys[i]] = data[keys[i]];
      }
    },
    error => { 
      console.log('error:'+JSON.stringify(error)); 
    });
  }

  save(){
    let keys,updatedKey,newVal;
    keys = Object.keys(this.processInfo);
    for(let i=0;i<keys.length;i++){
      if(this.processInfo[keys[i]] !== this.processInfoPrev[keys[i]]){
        updatedKey = keys[i];
        newVal = encodeURIComponent(this.processInfo[keys[i]]);
        break;
      }
    }
    
    if(updatedKey && newVal){
      this.dataservice.updateProcess(this.selectedProcessName,updatedKey,newVal).subscribe(data => {
        this.processInfo = data;
        this.processInfoPrev = data;
        this.showInfo = false;
        alert('modified data');
      });
    }
  }

  setNew() {
    this.addNew = true;
  }

  register() {
    this.dataservice.addprocess({'PROCESS':this.newProcessInfo.PROCESS_NAME,
      'DATABASE_HOST':this.newProcessInfo.DATABASE_HOST,
      'DATABASE_PASSWORD':this.newProcessInfo.DATABASE_PASSWORD,
      'QUEUE_CONNECTION_STRING':encodeURIComponent(this.newProcessInfo.QUEUE_CONNECTION_STRING)}).subscribe(data => {
      this.listAllProcesses();
      this.showInfo = false;
      this.addNew = false;
    });
  }
}
