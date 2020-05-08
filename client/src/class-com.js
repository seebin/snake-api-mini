import React, {useState, useEffect} from "react";

export class ClassCom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is: true,
    };
    console.log("constructor>>", this);

    this.testFun = this.testFun.bind(this);
  }

  componentDidMount(){
    console.log('componentDidMount')
  }
  componentDidUpdate(){
    console.log('componentDidUpdate')
  }

  testFun(e) {
    console.log("testFun>>>", e.target.value);
    this.setState({
      is:!this.state.is
    })
  }

  render() {
    console.log('render-------')
    return (
      <>
        <input value={this.props.name} onChange={this.testFun}/>
      <span>111111</span> 
      </>
    )
    
  }
}

export function TestHook() {
  const [name, setName] = useState('');
  const [age, setAge] = useState(1);

  useEffect(() => {
    // Update the document title using the browser API
    document.title = `seebin`;
    console.log('useEffect1111')
  },[name]);

  useEffect(() => {
    // Update the document title using the browser API
    document.title = `seebin`;
    console.log('useEffect22222')
  },[age]);

  return (
    <div>
      <button onClick={()=>setName('seebin')}>点我变seebin</button>
      <button onClick={()=>setAge(22222)}>点我变seebin222</button>
      <span>{name}</span>
      <span>{age}</span>
    </div>
  )
}
