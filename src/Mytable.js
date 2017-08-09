import React from 'react'
import createReactClass from 'create-react-class';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

function createMarkup(html) {
   return {__html: html};
}


const hebflip = string => {
  var ret = ''
  var heb = []
  var f = 0;
  for (var chr in string){
    if(string[chr] >= 'א' && string[chr] <= 'ת') {
      if(f===0) {
        ret += "<span dir='ltr'>";
        f = 1;
      }
      heb.push(string[chr]);
    }
    if(heb.length > 0  && (string[chr] < 'א'  ||  string[chr] > 'ת')) {
      ret += heb.reverse().join('');
      ret += '</span>';
      f = 0;
      heb = [];
    }
    if(string[chr] < 'א'  ||  string[chr] > 'ת') ret += string[chr];
  }
  return ret + heb.reverse().join('');
};

const TableComponent =createReactClass({
  render() {
    console.log(this.props.cols,'-',this.props.data)
    var ukey = this.props.ukey;
    var dataColumns = this.props.cols;
    var dataRows = this.props.data.map(function(obj){
      obj.id = obj[dataColumns[0]];
      return obj;
    });

    const linkPart = (x) => <button onClick={() => this.props.pushSubmit(x)}>{x}</button>

    var tableHeaders = (<thead className="Thead">
          <tr >
            {dataColumns.map(function(column,i) {
              return <th key={'th' + ukey + i}>{column}</th>; })}
          </tr>
      </thead>);

    var tableBody = dataRows.map(function(row,i) {
      return (
        <tr key={'tr' + ukey + i}>
          {dataColumns.map(function(column,j) {
            var content = row[column]
            content = (column==='Details' ? content : hebflip(content))
            content = (column==='Part Name' && content.indexOf('$')> 0 ? linkPart(content) : content)
            var markup = (column != 'Part Name' ? <td key={'td' + ukey + i + j}  dangerouslySetInnerHTML={createMarkup(content)}></td> : <td key={'td' + ukey + i + j}>{content}</td>)
            return markup })}
        </tr>); });

    return (<table className="table table-bordered table-hover table-striped table-sm table-responsive" width="100%">
        {tableHeaders}
        <tbody>
        {tableBody}
        </tbody>
      </table>)
  }
});


export default createReactClass({

  getInitialState: function getInitialState() {
    return {
      data: [{Empty:'yes'}],
      cols: ['Empty']
    };
  },

  componentDidMount: function componentDidMount() {
    var th = this;
    console.log("++++++++++++",this.props.dlink)
    this.serverRequest = axios.get(this.props.dlink).then(function (result) {
    	console.log("data:",result.data) ;
      if (result.data && result.data[0] != null) {
        th.setState({
          data: result.data,
          cols: Object.keys(result.data[0])
        });
      }
    });
    
  },

  render() {
    return (

      <div > 
        {this.state.cols[0] !== 'Empty' && <h3 className='center'>{this.props.title}</h3>}
        {this.state.cols[0] !== 'Empty' && <TableComponent data={this.state.data} cols={this.state.cols} ukey={this.props.ukey} pushSubmit={this.props.pushSubmit}/> }
      </div>
  
      )
  }

});

