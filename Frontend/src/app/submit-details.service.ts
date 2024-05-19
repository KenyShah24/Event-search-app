import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class SubmitDetailsService {

  tableData;
  constructor(private http: HttpClient) {
    this.tableData = {};
  }
  
  fetchSearchutil(keyword) {
  return this.http.get(`https://event-app-8.wl.r.appspot.com/autocomplete?keyword=${keyword}`)
  }

  setTableData(val:object){
    this.tableData = val;
  }

  getTableData(){
    return this.tableData;
  }
}
