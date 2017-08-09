import React from 'react'
import createReactClass from 'create-react-class';
import Mytable from './Mytable.js';

export default  createReactClass({
  render() {
    var th = this;    
    return (
      <div dir='ltr' >
          {this.props.props.map(function(p,i,j) {
            return <Mytable  key={p.dlink} dlink={p.dlink} title={p.title} ukey={i} pushSubmit={th.props.pushSubmit}/>
            })
          }
      </div>
      )
  }
});


