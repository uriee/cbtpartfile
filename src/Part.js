import React from 'react'
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import Tables from './Tables.js';


export default class part extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serialname: '',
      serial: 0, 
      partname: '',
      part: 0,
      tables: []
    };

    this.handlePartChange = this.handlePartChange.bind(this);
    this.handleSerialChange = this.handleSerialChange.bind(this);    
    this.handleSerialSubmit = this.handleSerialSubmit.bind(this);
    this.handlePartSubmit = this.handlePartSubmit.bind(this);    
    this.pushSubmit = this.pushSubmit.bind(this);
  }

  handleSerialChange(event) {
    this.setState({...this.state , serialname: event.target.value});
  }
  handlePartChange(event) {
    this.setState({...this.state , partname: event.target.value});
  }  

  pushSubmit(partname) {
   this.sbmt(partname);
  }

  sbmt(partname) {
    var th = this;
    console.log("qwerty: ",partname);
    var part = 'http://192.9.200.17:4001/inter/' + partname;
    this.serverRequest = axios.get(part).then(function (result) {
      console.log("data:",result.data) ;
      if (result.data.rowsAffected !== 0 && result.data[0]) {
        var part = result.data[0].PART
          th.setState({ ... th.state,
            partname : partname,
            part: part,
            tables: [
              {dlink:"http://192.9.200.17:4001/inter/part/"+part ,title:'נתונים למק"ט'},
              {dlink:"http://192.9.200.17:4001/inter/tempi/"+part ,title:'הוראות זמניות'},
              {dlink:"http://192.9.200.17:4001/inter/exttemp/"+part ,title:'מסמכים זמניים'},
              {dlink:"http://192.9.200.17:4001/inter/ext/"+part+"/Y" , title :'מסמכי איכות'},
              {dlink:"http://192.9.200.17:4001/inter/ext/"+part+"/N" , title :'מסמכים'},    
              {dlink:"http://192.9.200.17:4001/inter/spec7/"+part , title :'תיקי מוצר'},
              {dlink:"http://192.9.200.17:4001/inter/partarc/"+part+"/P" , title :'בנים מיוצרים'},
              {dlink:"http://192.9.200.17:4001/inter/partarc/"+part+"/R" , title :'בנים נרכשים'}, 
              {dlink:"http://192.9.200.17:4001/inter/proc/"+part ,title:'תהליך'},
              {dlink:"http://192.9.200.17:4001/inter/locations/"+part ,title:'מיקומים'}
              ]
            })
        }
      else alert('There is no such Part Name: ' + th.state.partname);
    });    
  }  



  handleSerialSubmit(event) {
    event.preventDefault();
    var th = this;
    var sObject = 'http://192.9.200.17:4001/inter/serial/' + this.state.serialname
    this.serverRequest = axios.get(sObject).then(function (result,err) {
      if (err) return
      var res =  result.data[0]  
              console.log("1:",th.state,result,sObject,res)
      th.setState({...th.state , 
          partname : res.PARTNAME,
          part : res.PART,
          serial: res.SERIAL
      })
                    console.log("2:",th.state)
      th.sbmt(th.state.partname);
      console.log(th.state)   
    }).catch((err)=>{console.log(err);return err})    
  }

  handlePartSubmit(event) {
     console.log("part",this.state)
    event.preventDefault();
    this.sbmt(this.state.partname);
    event.preventDefault();
  }  


  render() {
    return (
      <div>
        <form onSubmit={this.handleSerialSubmit} className="form-group">
          <label>
            Serial Name:
            <input type="text" className="form-control" value={this.state.serialname} onChange={this.handleSerialChange} />
          </label>        
          <input type="submit" className="btn btn-primary" value="Submit" />
        </form>
        <form onSubmit={this.handlePartSubmit} className="form-group">
          <label>
            Part Name:
            <input type="text" className="form-control"  value={this.state.partname} onChange={this.handlePartChange} />
          </label>
          <input type="submit" className="btn btn-primary" value="Submit" />
        </form>        
        <Tables props={this.state.tables} pushSubmit={this.pushSubmit} ></Tables>           
      </div>
    );
  }
}


