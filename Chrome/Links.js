function Links(){Base.call(this),this.datakey="Links_data",this.loadData(this.showTopSites,this.setDefaults)}Links.prototype=Object.create(Base.prototype),Links.prototype.constructor=Links,Links.prototype.init=function(){var t=this;$("#bookmark-panel").on("click","#remove_customLink",function(o){o.preventDefault(),t.removeCustomLink($(this).closest("a"))}),$("body").on("click","#addBookmark",{that:this},this.addBookmark),$("body").on("hidden.bs.modal","#addCustomLinkModal",function(){$("#addCustomLinkModal .modal-body").find("textarea,input").val("")})},Links.prototype.addBookmark=function(t){var o=t.data.that;o.data.push({title:$("#bookmark_name").val(),url:$("#bookmark_url").val()}),o.saveData(o.showTopSites())},Links.prototype.showTopSites=function(){chrome.topSites.get(function(t){var o="links",a={};a.topSites=t.slice(0,5),this.data&&this.data.length>0&&(a.customSites=this.data);var s=$("#bookmark-panel");this.displayTemplate("Links",o,a,s),this.saveData()}.bind(this))},Links.prototype.setDefaults=function(){this.data=[{title:"r/NBA",url:"https://www.reddit.com/r/nba"},{title:"r/NFL",url:"https://www.reddit.com/r/nfl"}],this.showTopSites()},Links.prototype.removeCustomLink=function(t){this.data.splice(parseInt(t.attr("id").split("_")[0]),1),0==this.data.length?($("#custom-sites").remove(),this.saveData()):this.saveData(this.showTopSites)};