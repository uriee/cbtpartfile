import React from 'react'
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import Tables from './Tables.js';


export default class part extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      partname: '',
      part: 0,
      tables: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.pushSubmit = this.pushSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({partname: event.target.value});
  }

  pushSubmit(partname) {
    console.log("Enter pushSubmit",partname , this.state.partname )
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
          th.setState({
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


  handleSubmit(event) {
    event.preventDefault();
    this.sbmt(this.state.partname);
    event.preventDefault();
  }


  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit} className="form-group">
          <label>
            Part Name:
            <input type="text" className="form-control" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" className="btn btn-primary" value="Submit" />
        </form>
        <Tables props={this.state.tables} pushSubmit={this.pushSubmit} ></Tables>           
      </div>
    );
  }
}


