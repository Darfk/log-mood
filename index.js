function uid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}

function twoZeroPad(s){
  return ("00" + s).substr(-2); 
}

function dateFormat(d) {
  if(typeof d !== "object") return "-";
  return d.getFullYear() + "-" + twoZeroPad((d.getMonth() + 1)) + "-" + twoZeroPad(d.getDate()) +
    " " + twoZeroPad(d.getHours()) + ":" + twoZeroPad(d.getMinutes()) + ":" + twoZeroPad(d.getSeconds());
}

var About = R.createClass({
  render:function () {
    return RcE("div", {className:"container"},
               RcE("h3", null, "Written by Thomas Payne"),
               RcE("p", null, "This application allows the user to log mood and stress alongside a note. log-mood does not ever send data to any server, it uses localStorage to store data."),
               RcE("h3", null, "Technologies used"),
               RcE("ul", null,
                   RcE("li", null, RcE("a", {href:"http://facebook.github.io/react", target:"external"}, "React")),
                   RcE("li", null, RcE("a", {href:"http://getskeleton.com", target:"external"}, "Skeleton")),
                   RcE("li", null, RcE("a", {href:"https:developer.mozilla.org/en-US/docs/Web/API/Storage/LocalStorage", target:"external"}, "localStorage"))));
  },
});

var Settings = R.createClass({
  exportCSV:function () {
    var entries = this.props.app.state.entries;
    return entries.reduce(function (a, e) {
      return a + ([e.id, (new Date(e.datetime)).toISOString(), e.mood, e.stress, e.note].map(function (i){
        return "\"" + i + "\"";
      }).join(",")) + "\n";
    }, "");
  },
  render:function () {
    this.exportCSV();
    return RcE("div", {className:"container"},
               RcE("h3", null, "Import/Export"),
               RcE("p", null,
                   RcE("a", {href:"data:text/csv," + encodeURIComponent(this.exportCSV())}, "Export CSV")),
               RcE("div", null, this.exportCSV())
              );
  },
});

var EntryForm = R.createClass({
  getInitialState:function () {
    var loadedState = this.load();
    if(loadedState === null) {
      return {
        mood: 1,
        stress: 1,
        date:(new Date()).getTime(),
        note:"",
      };
    }
    return loadedState;
  },

  incDateFunc:function (t) {
    var self = this;
    return function () {
      self.setState({
        date: self.state.date + t, 
      });
    }
  },

  setDateToNow:function () {
    this.setState({
      date:(new Date()).getTime(),
    });
  },

  addEntry:function (e) {
    e.preventDefault();
    var fields = e.target.querySelectorAll("input, textarea");
    var data = {};
    for(var i in fields) {
      if(!fields.hasOwnProperty(i)) continue;
      var field = fields[i];
      data[field.name] = field.value;
    };
    data.datetime = this.state.date;
    data.id = uid();
    this.setState({
      note:""
    });
    this.props.app.addEntry(data);
  },

  load:function () {
    var state = window.localStorage.getItem("entryForm.state");
    try {
      state = JSON.parse(state);
    } catch(e) {
      state = {};
    }
    return state;
  },

  save:function () {
    window.localStorage.setItem("entryForm.state", JSON.stringify(this.state));
  },

  componentDidUpdate:function () {
    this.save();
  },

  changeMood:function (e) {
    this.setState({
      mood:e.target.value,
    });
  },

  changeStress:function (e) {
    this.setState({
      stress:e.target.value,
    });
  },

  changeNote:function (e) {
    this.setState({
      note:e.target.value,
    });
  },

  render: function () {
    return RcE("form", {className:"container", onSubmit:this.addEntry},
               RcE("div", {className:"row"},
                   RcE("div", {className:"columns six"},
                       RcE("input", {
                         className:"u-full-width", 
                         type:"text",
                         name:"datetime",
                         value:dateFormat(new Date(this.state.date)),
                       })),
                   RcE("div", {className:"columns six"},
                       RcE("button", {
                         className: "u-full-width",
                         type:"button",
                         onClick:this.setDateToNow,
                       }, "now"))),
               RcE("div", {className:"row"},
                   RcE("div", {className:"columns two"},
                       RcE("button", {
                         className: "u-full-width",
                         type:"button",
                         onClick:this.incDateFunc(1 * 60 * 1000),
                       }, "+1m")),
                   RcE("div", {className:"columns two"},
                       RcE("button", {
                         className: "u-full-width",
                         type:"button",
                         onClick:this.incDateFunc(-1 * 60 * 1000),
                       }, "-1m")),
                   RcE("div", {className:"columns two"},
                       RcE("button", {
                         className: "u-full-width",
                         type:"button",
                         onClick:this.incDateFunc(15 * 60 * 1000),
                       }, "+15m")),
                   RcE("div", {className:"columns two"},
                       RcE("button", {
                         className: "u-full-width",
                         type:"button",
                         onClick:this.incDateFunc(-15 * 60 * 1000),
                       }, "-15m")),
                   RcE("div", {className:"columns two"},
                       RcE("button", {
                         className: "u-full-width",
                         type:"button",
                         onClick:this.incDateFunc(1440 * 60 * 1000),
                       }, "+1d")),
                   RcE("div", {className:"columns two"},
                       RcE("button", {
                         className: "u-full-width",
                         type:"button",
                         onClick:this.incDateFunc(-1440 * 60 * 1000),
                       }, "-1d"))),
               RcE("div", {className:"row"},
                   RcE("div", {className:"columns two"},
                       RcE("label", null, "Mood")),
                   RcE("div", {className:"columns four"},
                       RcE("input", {
                         className:"u-full-width", 
                         name:"mood",
                         type:"number",
                         max:10,
                         min:1,
                         defaultValue: this.state.mood,
                         placeholder:"M",
                         size: 1,
                         onChange:this.changeMood,
                       })),
                   RcE("div", {className:"columns two"},
                       RcE("label", null, "Stress")),
                   RcE("div", {className:"columns four"},
                       RcE("input", {
                         className:"u-full-width", 
                         name:"stress",
                         type:"number",
                         max:10,
                         min:1,
                         defaultValue: this.state.stress,
                         step:1,
                         onChange:this.changeStress,
                       }))),
               RcE("div", {className:"row"},
                   RcE("div", {className:"columns twelve"},
                       RcE("textarea", {
                         className:"u-full-width",
                         name:"note",
                         placeholder:"Note",
                         value:this.state.note,
                         onChange:this.changeNote,
                       }))),
               RcE("div", {className:"row"},
                   RcE("button", {
                     className: "button-primary u-full-width",
                     type:"submit",
                   }, "submit"))
              );
  },
});

var EntryTable = R.createClass({
  getDefaultProps: function () {
    return {
      app:null,
    };
  },
  render: function() {
    var self = this;
    var createEntryRow = function(entry, index) {
      return RcE("tr", null,
                 RcE("td", null, entry.id.substr(0, 4)),
                 RcE("td", null, dateFormat(new Date(entry.datetime))),
                 RcE("td", null, entry.mood),
                 RcE("td", null, entry.stress),
                 RcE("td", null, entry.note.substr(0, 25) + (entry.note.length > 25 ? "..." : "")),
                 RcE("td", null, RcE("button", {
                   className:"tiny button-danger",
                   onClick: function () {
                     self.props.app.removeEntry(index);
                   }
                 }, "del"))
                );
    };

    var entries = this.props.app.state.entries;

    return RcE("div", {className:"container"},
               RcE("table", {className:"table u-full-width"},
                   RcE("thead", null,
                       RcE("tr", null,
                           RcE("th", null, "ID"),
                           RcE("th", null, "Date/Time"),
                           RcE("th", null, "Mood"),
                           RcE("th", null, "Stress"),
                           RcE("th", null, "Note"),
                           RcE("th", null, "Delete"))),
                   RcE("tbody", null, entries.map(createEntryRow))));
  }
});

var Nav = R.createClass({
  navigate:function (n) {
    var self = this;
    return function () {
      self.props.app.setState({view:n});
    };
  },

  render:function () {
    return RcE("nav", {className:"container"},
              RcE("row", null,
                  RcE("div", {className:"columns four"},
                      RcE("button", {onClick:this.navigate("log"), className:"u-full-width"}, "Log")),
                  RcE("div", {className:"columns four"},
                      RcE("button", {onClick:this.navigate("settings"), className:"u-full-width"}, "Settings")),
                  RcE("div", {className:"columns four"},
                      RcE("button", {onClick:this.navigate("about"), className:"u-full-width"}, "About"))
                 ));
  },
});

var App = R.createClass({
  getInitialState:function () {
    var loadedState = this.load();
    if(loadedState === null){
      return {
        entries:[],
        view:"log",
      };
    }
    return loadedState;
  },

  addEntry:function(entry){
    entry.id = uid();
    this.setState({
      entries: this.state.entries.concat(entry),
    });
  },

  removeEntry:function (index) {
    var entries = this.state.entries.splice(0);
    entries.splice(index, 1);
    this.setState({
      entries: entries,
    });
  },

  reset: function () {
    this.setState({
      entries:[],
    });
  },

  componentDidUpdate:function () {
    this.save();
  },

  load:function () {
    var state = window.localStorage.getItem("app.state");
    try {
      state = JSON.parse(state);
    } catch(e) {
      state = {};
    }
    return state;
  },

  save:function () {
    window.localStorage.setItem("app.state", JSON.stringify(this.state));
  },

  render:function () {
    var appElements = [];
    var view = this.state.view;
    appElements.push(RcE("div", {className:"container"}, RcE("h1", null, "log-mood", RcE("small", null, " ver 0.1"))));
    appElements.push(RcE(Nav, {app:this}));
    if(! view || view === "log"){
      appElements.push(RcE(EntryForm, {app:this}));
      appElements.push(RcE(EntryTable, {app:this}));
    } else if (view === "about") {
      appElements.push(RcE(About, {app:this}));
    } else if (view === "settings") {
      appElements.push(RcE(Settings, {app:this}));
    }
    return RcE("div", null, appElements);
  },
})

window.onload = function () {
  R.render(RcE(App), document.getElementById("app"));
};
