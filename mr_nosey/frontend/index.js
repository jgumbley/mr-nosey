var DebugPanel = React.createClass({
    render: function() { return (
      <pre id="language-html">
        {this.props.json}
      </pre>
    )}
});

var ToggleDebugPanelCheckbox = React.createClass({
    handleChange: function(e) { 
        this.props.onUpdate(this.props.checked);
        return;
    },
    render: function() { return (
        <div className="checkbox">
            <label>
                <input type='checkbox'
                    onChange={this.handleChange} 
                    checked={this.props.checked} />
                Show debug
            </label>
        </div>
    )}
});

var LiteralJSON = React.createClass({
  loadFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(json) {
        this.setState({json: json});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
      return {json: {data: { children:{} }},
              debug: false };
  },
  handleUpdateDebugState: function(currentState) {
      this.setState({ debug: !( currentState ) });
  },
  componentDidMount: function() {
    this.loadFromServer();
    setInterval(this.loadFromServer, this.props.poll);
  },
  render: function() {
    return (
      <div className="LiteralJSON">
        <hr/>
        <D3Chart width={1140} height={400} data={this.state.json}/>
        <hr/>
        <ToggleDebugPanelCheckbox checked={this.state.debug} onUpdate={this.handleUpdateDebugState} />
        { this.state.debug ? (
            <DebugPanel json={JSON.stringify(this.state.json)}/>
            ): null
        }
      </div>
    );
  }
});

var D3Chart = React.createClass({
  render: function() {
    return (
      <div className="D3Chart">
      </div>
    );
    },
   componentDidUpdate: function() {
   /* Seems not unreasonable to have the D3 initialise in here
    */
        this.updateD3();
    },
   componentDidMount: function() {
   /* Seems not unreasonable to have the D3 initialise in here
    */
        this.svg = d3.select(this.getDOMNode()).append("svg");
        this.svg
            .attr("width", this.props.width)
            .attr("height", this.props.height);
       
        this.force = d3.layout.force()
            .charge(-220)
            .size([this.props.width, this.props.height]);


        
        this.updateD3();
    },
   updateD3: function() {

        console.log("updating force directed layout");

        var currentArray = this.force.nodes();
        var newArray = [];
        
        var lookup = {};
        for (var i = 0, len = currentArray.length; i < len; i++) {
            lookup[currentArray[i].name] = currentArray[i];
            };

        var inputArray = this.props.data.data.children;
        console.log(inputArray);

        for (i = 0; i < inputArray.length; i++) { 
            var item = inputArray[i];
            var name = inputArray[i].name;
             if(typeof lookup[name] === 'undefined'){
                console.log("adding");
                newArray.push(item);
                } else {
                newArray.push(lookup[name]);
                };
            };

       console.log(newArray);


        this.force.nodes(newArray);

        this.circleJoin = this.svg.selectAll("circle")
                .data(this.force.nodes(), 
                      function(d) { 
                        return d.name; }
                      );

        this.circleJoin.enter().append("circle")
                .attr("r", 30)
                .call(this.force.drag());

        this.circleJoin.exit().remove();

        this.force.on('tick', function() {
            this.circleJoin.attr('cx', function(d) { return d.x; })
                .attr('cy', function(d) { return d.y; });
        }.bind(this));

        this.force.start();
        
   }
});

React.render(
  <LiteralJSON url="api" poll={2000}/>,
  document.getElementById('content')
);


