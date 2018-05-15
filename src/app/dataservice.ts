import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class DataService { 
    constructor(private http:HttpClient) { }
    
    getAllProcess() {
      return this.http.get('http://localhost:8080/getallprocess')
            .map(result => {
                return result;
            });
    }

    getProcessInfo(processName){
        return this.http.get(`http://localhost:8080/getenvironment/${processName}`)
            .map(result => {
                return result;
            });
    }

    updateProcess(processName,key,value){
        return this.http.get(`http://localhost:8080/setenvironment/${processName}/${key}/${value}`)
            .map(result => {
                return result;
            });
    }

    addprocess(processObj){
        return this.http.post(`http://localhost:8080/addprocess`,processObj,httpOptions)
            .map(result => {
                return result;
            });
    }
}
