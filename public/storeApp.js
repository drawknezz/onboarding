storeApp = {};
			
storeApp.productsGrid = function(){
	var that = {};
	
	var dom = null;
	var header = null;
	var viewer = null;
	var footer = null;
	
	that.setHeader = function(h){
		header = h;
	};
	
	that.getHeader = function(){
		return header;
	};
	
	that.setViewer = function(v){
		viewer = v;
	};
	
	that.getViewer = function(){
		return viewer;
	};
					
	that.setFooter = function(f){
		footer = f;
	};
	
	that.getFooter = function(){
		return footer;
	};
	
	that.render = function(){
		var div = document.createElement('DIV');
		div.setAttribute('class', 'productsGrid');
		
		if(header) div.appendChild(header.render());
		if(viewer) div.appendChild(viewer.render());
		if(footer) div.appendChild(footer.render());
		
		dom = div;
		
		return div;
	};
	
	return that;
};

storeApp.productsHeader = function(params){
	var that = {};
	params = params || {};
	
	var dom = null;
	var buttons = [];
	if(!params.id) {
		throw "An id must be specified for the header element";
	}
	var id = params.id;
	
	if(params.buttons){
		for(var i = 0; i < params.buttons.length; i++){
			buttons.push(storeApp.button(params.buttons[i]));
		}
	}
	
	var clearButtons = function(){
		buttons = [];
	};
	
	var repaint = function(){
		if(!dom){
			throw "there's no dom element to paint on.";
		}
		dom.innetHTML = '';
		for(var i = 0; i < buttons.length; i++){
			dom.appendChild(buttons[i].render());
		}
	};
	
	var addButton = function(button){
		buttons.push(button);
	};
	
	var getButtonById = function(id){
		for(var i = 0; i < buttons.length; i++){
			if(buttons[i].getId() == id) return buttons[i];
		}
	};
	
	that.render = function(){
		var div = document.createElement('DIV');
		div.setAttribute('id', id);
		
		for(var i = 0; i < buttons.length; i++){
			div.appendChild(buttons[i].render());
		}
		
		dom = div;
		
		return div;
	};
	
	that.clearButtons = function(){
		return clearButtons();
	};
	
	that.repaint = function(){
		return repaint();
	};
	
	that.addButton = function(button){
		return addButton(button);
	};
	
	that.getButtonById = function(id){
		return getButtonById(id);
	};
	
	return that;
};
			
storeApp.productsViewer = function(params){
	var that = {};
	params = params || {};
	
	var products = [];
	var dom = null;
	if(!params || !params.id) {
		throw "An id must be specified for the header element";
	}
	var id = params.id;
	var subscribers = [];
	var sortingField = 'name';
	var sortingFieldGetter = "getName";
	var sortingAsc = true;
	var sorter = function(a, b){
		if(!sortingAsc){
			var t = b;
			b = a;
			a = t;
		}
		return a[sortingFieldGetter]() > b[sortingFieldGetter]()? 1 : a[sortingFieldGetter]() == b[sortingFieldGetter]()? 0: -1;
	};
	
	var selected = null;
	var onSelect = params.listeners && params.listeners.onSelect;
	
	var notify = function(msg, data){
		for(var i = 0; i < subscribers.length; i++){
			if(typeof subscribers[i].notify === 'function'){
				subscribers[i].notify(msg, data);
			}
		}
	};
	
	var applyZebra = function(){
		var cols = ["#7B9EDA", "#BBBEDD"];
		var col = 0;
		
		var setBase = function(col){
			products[i].setBaseColor(col);
		};
		
		for(var i = 0; i < products.length; i++){
			var proddom = products[i].getDom();
//			products[i].setBaseColor(cols[col]);
			
			if(selected && selected == products[i]){
				products[i].paintSelected();
				products[i].getDom().setAttribute('class', 'productBox selected');
			}else{
				products[i].animToColor(cols[col], 20, 10, setBase(cols[col]));
			}
			
			col = +!col;
		}
	};
	
	var repaint = function(){
		console.log('repainting view');
		if(!dom){
			throw "there's no dom element to paint on.";
		}
		dom.innerHTML = '';
		products.sort(sorter);
		
		for(var i = 0; i < products.length; i++){
			var proddom = products[i].render();
			proddom.style.display = 'none';
			dom.appendChild(proddom);
			$(proddom).fadeIn();
		}
		
		applyZebra();
	};
	
	//add products to the view
	var addProducts= function(prods){
		for(var i = 0; i < prods.length; i++){
			var prod = storeApp.product(prods[i]);
			prod.setViewer(that);
			
			products.push(prod);
		}
	};
	
	var clearProducts= function(){
		//if there's a product selected, unselect it
		if(selected) $(dom).trigger('productUnselected', {id:selected.getId()});
		products = [];
	};

	var loadProducts = function(params, callback){
		clearProducts();
		$.ajax({
			url: 'http://localhost:8080/product',
			method: 'GET',
			data: params,
			dataType: 'json',
			success: function(data){
				notify('productsLoaded', data);
				
				addProducts(data);
				
				repaint();
				
				if(callback) callback();
			}
		});
	};
	
	var getProductById = function(id){
		for(var i = 0; i < products.length; i++){
			if(products[i].getId() == id) return products[i];
		}
	};
	
	that.removeProductById = function(id){
		for(var i = 0; i < products.length; i++){
			if(products[i].getId() == id){
				products.splice(i, 1);
				notify('productsLoaded', products);
				applyZebra();
				return;
			}
		}
	};

	that.render = function(){
		var div = document.createElement('DIV');
		div.setAttribute('class', 'productViewer');
		div.oncontextmenu = function(){return false;};
		
		for(var i = 0; i < products.length; i++){
			div.appendChild(products[i].render());
		}
		
		$(div).on('productDeleted', function(e, ops){
			console.log('[viewer.evt] productDeleted');
			if(selected && selected.getId() === ops.id){
				console.log('selected product was just deleted.');
				onSelect({ selected: null });
				selected = null;
			}
		}).on('productSelected', function(e, ops){
			console.log('[viewer.evt] productSelected');
			var prod = getProductById(ops.id);
			
			selected = prod;
			
			onSelect({ selected: prod });
			
			for(var i = 0; i < products.length; i++){
				if(products[i] !== prod) products[i].unselect();
			}
		}).on('productUnselected', function(e, ops){
			console.log('[viewer.evt] productUnselected');
			if(selected.getId() === ops.id){
				onSelect({ selected: null });
				selected = null;
			}
		});
		
		$(dom).trigger('productSelected', {id: id});
		$(dom).trigger('productUnselected', {id: id});
		
		dom = div;
		
		return div;
	};
	
	that.scrollToProductById = function(id, callback){
		var product = getProductById(id);
		
		if(product){
			$(dom).animate({
				scrollTop: $(product.getDom()).position().top - $(dom).position().top
			},'slow', callback);
		}
		
	};
	
	that.getProduct = function(index){
		return products[index];
	};
	
	that.getProducts = function(){
		return products;
	};
	
	that.getProductCount = function(){
		return products.length;
	};
	
	that.repaint = function(){
		return repaint();
	};
	
	that.addProducts = function(prods){
		return addProducts(prods);
	};
	
	that.clearProducts = function(){
		return clearProducts();
	};
	
	that.loadProducts = function(params, callback){
		return loadProducts(params, callback);
	};
	
	that.getDom = function(){
		return dom;
	};
	
	that.getProductById = function(id){
		return getProductById(id);
	};
	
	that.getSelected = function(){
		return selected;
	};
	
	that.getSortingField = function(){
		return sortingField;
	};
	
	that.isSortingAsc = function(){
		return sortingAsc;
	};
	
	that.getSortingGetter = function(){
		return sortingFieldGetter;
	};
	
	that.sortBy = function(f, asc){
		sortingField = f.name;
		sortingFieldGetter = f.getter;
		sortingAsc = asc;
		repaint();
	};
	
	that.addSubscriber = function(obj){
		subscribers.push(obj);
	};
	
	that.getProductByCoordinates = function(x, y){
		if(!dom) {
			console.log('the viewer isn\'t rendered yet');
			return;
		}
		
		var current = 0;
		var height = dom.clientHeight;
		
		if(y > height){
			console.log('passed y coordinate outside of the viewer.');
		}else{
			for(var i = 0; i < products.length; i++){
				var top = Math.abs(dom.getBoundingClientRect().top - products[i].getDom().getBoundingClientRect().top);
				var ph = products[i].getDom().clientHeight;
				
				if(y > top && y < (top + ph)){
					return products[i];
				}
				
				if(top > height){
					console.log('product not visible');
					return null;
				}
			}
		}
	};
	
	return that;
};

storeApp.productsFooter = function(params){
	var that = {};
	params = params || {};
	
	var dom = null;
	if(!params || !params.id){
		throw "An id must be specified for the footer element";
	}
	var id = params.id;
	var viewer = params.viewer;
	var domCant = null;
	
	var clearButtons = function(){
		buttons = [];
	};

	if(viewer){
		viewer.addSubscriber(that);
	}
	
	var repaint = function(){
		if(!dom){
			throw "there's no dom element to paint on.";
		}
		dom.innetHTML = '';
		for(var i = 0; i < buttons.length; i++){
			dom.appendChild(buttons[i].render());
		}
	};
	
	var addButton = function(button){
		buttons.push(button);
	};
	
	var updateCantProds = function(data){
		if(domCant){
			domCant.textContent = data.length + ' products listed.';
		}
	};
	
	that.render = function(){
		var div = document.createElement('DIV');
		div.setAttribute('id', id);
		div.setAttribute('class', 'noselect');
		
		var dcant = document.createElement('DIV');
		dcant.setAttribute('class', 'prodcant');
		
		domCant = dcant;
		
		var dsort = document.createElement('DIV');
		dsort.setAttribute('class', 'sorter');
		
		var dstext = document.createElement('DIV');
		dstext.textContent = 'sorting by';
		
		var select = document.createElement('SELECT');
		var fields = storeApp.product({id:'sorterP'}).getSortableFields();
		
		var addOption = function(f){
			var option = document.createElement('OPTION');
			option.textContent = f.name;
			
			option.setAttribute('getter', f.getter);
			
			select.appendChild(option);
		};
		
		for(var i = 0; i < fields.length; i++){
			addOption(fields[i]);
		}

		if(viewer){
			select.value = viewer.getSortingField();
		}
		
		select.onchange = function(e, t){
			console.log('select changed');
			if(viewer){
				var sortingField = {name: select.value, getter: select.selectedOptions[0].getAttribute('getter')};
				viewer.sortBy(sortingField, dsasc.textContent !== 'desc');
			}
		};
		
		var dsasc = document.createElement('DIV');
		dsasc.setAttribute('class', 'sortbutton');
		dsasc.textContent = 'asc';
		
		dsasc.onclick = function(){
			if(dsasc.textContent === 'asc'){
				dsasc.textContent = 'desc';
			}else{
				dsasc.textContent = 'asc';
			}
			
			if(viewer){
				var sortingField = {name: select.value, getter: select.selectedOptions[0].getAttribute('getter')};
				viewer.sortBy(sortingField, dsasc.textContent !== 'desc');
			}
		};
		
		dsort.appendChild(dcant);
		dsort.appendChild(dstext);
		dsort.appendChild(select);
		dsort.appendChild(dsasc);
		
		div.appendChild(dsort);
		
		dom = div;
		
		return div;
	};
	
	that.clearButtons = function(){
		return clearButtons();
	};
	
	that.repaint = function(){
		return repaint();
	};
	
	that.addButton = function(button){
		return addButton(button);
	};
	
	that.notify = function(msg, data){
		switch (msg){
		case 'productsLoaded':
			updateCantProds(data);
			break;
		}
	};
	
	return that;
};

storeApp.colorDiffs = function(color1, color2){
	var reg = /^#*([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/;
	if(!reg.test(color1)){
		throw "Invalid color1 parameter passed to colorDiffs: " + color1;
	}
	if(!reg.test(color2)){
		throw "Invalid color2 parameter passed to colorDiffs: " + color2;
	}
	var cols = color1.match(reg);
	var r = parseInt(cols[1], 16);
	var g = parseInt(cols[2], 16);
	var b = parseInt(cols[3], 16);

	var cols2 = color2.match(reg);
	var r2 = parseInt(cols2[1], 16);
	var g2 = parseInt(cols2[2], 16);
	var b2 = parseInt(cols2[3], 16);
	
	return {col1: {r:r, g:g, b:b}, col2: {r:r2, g:g2, b:b2}, r:(r-r2), g:(g-g2), b:(b-b2)};
};

storeApp.formatColor = function(r,g,b){
	var t = /^[0-9]{1,3}$/;
	if(!t.test(r) || !t.test(g) || !t.test(b)){
		throw new Error('formatColor expects numbers of no more than 3 digits');
	}

	return "#" + (1e15+r.toString(16)+'').slice(-2) + (1e15+g.toString(16)+'').slice(-2) + (1e15+b.toString(16)+'').slice(-2);
};

storeApp.addColor = function(color, red, green, blue){
	var reg = /^#*([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/;
	var t = /^-*[0-9]{1,3}$/;
	if(!reg.test(color)){
		throw new Error("Invalid color parameter passed to addColor " + color);
	}
	if(!t.test(red) || !t.test(green) || !t.test(blue)){
		throw new Error('addColor expects numbers of no more than 3 digits for color components');
	}

	var cols = color.match(reg);
	var r = parseInt(cols[1], 16);
	var g = parseInt(cols[2], 16);
	var b = parseInt(cols[3], 16);

	var sum = function(a, b){
		var c = a + b;
		return c > 255? 255: c < 0? 0: c;
	};
	
	return storeApp.formatColor(sum(r,red), sum(g,green), sum(b,blue));
};

storeApp.getColorTransitions = function(colors, steps){
	var transitions = [];
	var diff = null;
	var sr, sg, sb;
	for(var c = 0; c < colors.length-1; c++){
		diff = storeApp.colorDiffs(colors[c], colors[c+1]);
		
		for(var i = 0; i <= steps; i++){
			sr = Math.round(((diff.col1.r-diff.col2.r)/(-steps))*(i) + diff.col1.r);
			sg = Math.round(((diff.col1.g-diff.col2.g)/(-steps))*(i) + diff.col1.g);
			sb = Math.round(((diff.col1.b-diff.col2.b)/(-steps))*(i) + diff.col1.b);
			
			if(sr < 0) sr = 0;
			if(sg < 0) sg = 0;
			if(sb < 0) sb = 0;
			
			transitions.push(storeApp.formatColor(sr, sg, sb));
		}
	}
	
	return transitions;
};

storeApp.button = function(btn){
	var that = {};
	btn = btn || {};
	
	var text = btn.text || 'button';
	var id = btn.id || 'btn' + btn.text;
	var handler = btn.handler || function(){console.log('button ' + btn.text + ' clicked!');};
	var baseColor = btn.baseColor || '#CCCCCC';
	var disabledColor = "#818181";
// 				var back = null;
	var dom = null;
	var enabled = typeof btn.enabled === 'undefined'?true:btn.enabled;
	
	var getColors = function(color){
		return 'linear-gradient(' + storeApp.addColor(color, 86, 131, 110) + ' 10%,' + storeApp.addColor(color, 5, 43, 24) + ' 60%, ' + color + ' 90%, ' + storeApp.addColor(color, -34, -24, -24) + ' 100%)';
	};
	
// 				back = getColors(baseColor);
	
	that.enable = function(){
		enabled = true;
		if(dom){
			applyColor(baseColor);
			
			console.log('btn[' + id + ']: enabled');
			$(dom).removeClass('disabledButton');
		}
	};
	
	that.disable = function(){
		enabled = false;
		if(dom){
			applyColor(disabledColor);
			
			console.log('btn[' + id + ']: disabled');
			$(dom).addClass('disabledButton');
		}
	};
	
	var applyColor = function(color, e){
		var el = e || dom;
		if(!el){
			throw 'there is no dom element to be applied a color';
		}
		el.style.background = getColors(color);
		el.style.color = storeApp.addColor(color, -100, -100, -100);
		el.style.textShadow = "0 1px 1px " + storeApp.addColor(color, 86, 131, 110);
	};
	
	that.applyColor = function(color){
		return applyColor(color);
	};
	
	that.setHandler = function(f){
		handler = f;
	};
	
	that.render = function(){
		var dbutton = document.createElement("DIV");
		dbutton.setAttribute('id', id);
		dbutton.setAttribute('class', 'button noselect');
		dbutton.textContent = text;
		
		$(dbutton).click(function(e){
			if(enabled){
				handler(e);
			}
		});
		
		applyColor(enabled?baseColor:disabledColor, dbutton);

		for(var i = 0; i < btn.listeners; i++){
			$(dom).on(listeners[i].eventName, listeners[i].fn);
		}
		
		dom = dbutton;
		
		return dbutton;
	};
	
	that.getId = function(){return id;};
	
	return that;
};

storeApp.formatNumber = function(number){
	var reg = /(\d+)(\d{3})/;
	var n = +number;

	if(n!==n){
		throw new Error('formatNumber expects a numeric value');
	}

	n = n+'';

	while(reg.test(n)){
		n = n.replace(reg, '$1' + '.' + '$2');
	}
	
	return n;
};

storeApp.product = function(prod){
	var that = {};
	prod = prod || {};
	
	if(!prod.id) throw "product needs an Id";
	var id = prod.id || 0;
	var name = prod.name || '';
	var price = prod.price || 0;
	var description = prod.description || '';
	var stock = prod.stock || 0;
	var dom = null;
	var buttons = [];
	var baseColor = prod.baseColor || "#818181";
	var highColor = prod.highColor || "#006598";
	var backcolor = '#889CAB';
	var viewer = null;
	var currentAnim = null;
	var currentColor = baseColor;
	var selected = false;
	
	var getColors = function(color){
		return 'linear-gradient(' + storeApp.addColor(color, 60, 60, 60) + ', ' + color + ')';
	};
	
	var back = getColors(baseColor);
	
	var applyColor = function(color){
		back = getColors(color);
		currentColor = color;
		if(dom){
			dom.style.background = back;
		}
	};
	
	var afterDelete = function(){
		if(dom){
			$(dom).animate({
				opacity: 0,
				height: 0
			},{
				complete: function(){
					dom.style.display = 'none';
					if(viewer){
						viewer.removeProductById(id);
					}
				}
			});
		}
	};
	
	var afterEdit = function(){
		console.log('product ID ' + id + ' was succesfully edited.');
	};
	
	var del = function(evt, callback){
		if(evt) evt.stopPropagation();
		$.ajax({
			url: 'http://localhost:8080/product?id=' + id + '&name=' + name,
			method: 'DELETE',
			contentType: 'application/json;charset=UTF-8',
			data: {id: id, name: name},
			dataType: 'json',
			success: function(data){
				if(data > 0){
					$(dom).trigger('productDeleted', {id: id});
					
					if(callback){
						callback();
						return;
					}
					afterDelete();
				}
			}
		});
	};
	
	var edit = function(evt){
		console.log("edit product " + id);
		
		var form = storeApp.form({
			id: 'formEdit',
			title: 'edit product id ' + id,
			url: 'product',
			method: 'PUT',
			basecolor: '#114298',
			fields: [
				{
					id: 'txtName',
					label: 'name',
					submitParam: 'nname',
					validator: /^[a-zA-Z_0-9]{0,50}$/,
					maxLength: 50
				},
				{
					id: 'txtPrice',
					label: 'price',
					submitParam: 'nprice',
					validator: /^[0-9]{0,7}$/,
					maxLength: 7
				},
				{
					id: 'txtDescription',
					label: 'description',
					submitParam: 'ndescription',
					validator: /^[a-zA-Z_0-9 ]{0,50}$/,
					maxLength: 50
				},
				{
					id: 'txtStock',
					label: 'stock',
					submitParam: 'nstock',
					validator: /^[0-9]{0,5}$/,
					maxLength: 5
				}
			],
			button: storeApp.button({text:'confirm', id:'btnConfirmEdit', baseColor: '#5D88CF'}),
			extraParams: ['id=' + id, 'name=' + name, 'price=' + price, 'description=' + description, 'stock=' + stock],
			afterSubmit: function(data, form){
				console.log('product modified correctly, with id: ' + data);
				
				if(form){
					var dom = form.getDom();
					
					if(dom){
						dom.parentElement.removeChild(dom);
					}
				}
				
				var view = storeApp.grid.getViewer();
				view.loadProducts(null, function(){
					view.scrollToProductById(id, function(){
						view.getProductById(id).highlightNew();
					});
				});
			}
		});
		document.body.appendChild(form.render());
		
		if(evt) evt.stopPropagation();
		
		afterEdit();
	};
	
	var select = function(){
		selected = true;
		
		if(dom){
			$(dom).addClass('selected');
			$(dom).trigger('productSelected', {id: id});
		}
		
		paintSelected();
	};
	
	var unselect = function(){
		selected = false;
		
		if(dom){
			$(dom).removeClass('selected');
			$(dom).trigger('productUnselected', {id: id});
		}
		
		paintUnselected();
	};
	
	buttons.push(storeApp.button({text:'edit', id:'btnEditProd' + id, baseColor: '#5D88CF', 
		handler: edit}));
	buttons.push(storeApp.button({text:'delete', id:'btnDeleteProd' + id, baseColor: '#D5361A', 
		handler: del}));
	
	that.render = function(){
		var dprod = document.createElement("DIV");
		dprod.setAttribute('id', 'prod' + id);
		dprod.setAttribute('class', 'productBox noselect');
		dprod.style.backgroundColor = backcolor;
		
		if(back) dprod.style.background = back;
		
		//context menu
		dprod.oncontextmenu = function(e){
			if(e.button == 2){
				//select product
				var vdom = viewer.getDom();
				if(!vdom){
					console.log('viewer is not rendered.');
					return;
				}
				var prod = viewer.getProductByCoordinates(e.offsetX, Math.abs(vdom.getBoundingClientRect().top - e.y));
				if(!prod){
					console.log('no products under the mouse cursor.');
					return;
				}
				prod.select();
				
				var m = document.createElement('DIV');
				m.setAttribute('class', 'contextmenu');
				m.setAttribute('tabindex', '0');
				m.oncontextmenu = function(){return false;};

				m.style.left = e.x + 'px';
				m.style.top = e.y + 'px';

				m.onblur = function(){
					if(m.parentElement) m.parentElement.removeChild(m);
				};

				//menu buttons
				var addButton = function(label, handler){
					var btn = document.createElement('DIV');
					btn.setAttribute('class', 'ctxbutton');
					btn.textContent = label;
					
					$(btn).click(function(){
						if(typeof handler === 'function'){
							handler();
						}
						m.onblur();
					});
					
					m.appendChild(btn);
				};
				
				addButton('edit', function(){
					if(viewer){
						var sprod = viewer.getSelected();
						
						if(sprod){
							sprod.edit();
						}
					}
				});
				
				addButton('delete', function(){
					if(viewer){
						var sprod = viewer.getSelected();
						
						if(sprod){
							sprod.del();
						}
					}
				});
				
				document.body.appendChild(m);
				m.focus();
			}
			
			return false;
		};
		
		
		var sident = document.createElement("DIV"); //desc - price
		sident.style.clear = 'both';
		
		var sdesc = document.createElement("DIV");
		sdesc.setAttribute('class', 'productDesc');
		sdesc.textContent = description;
		
		var sprice = document.createElement("DIV");
		sprice.setAttribute('class', 'productPrice');
		sprice.textContent = '$ ' + storeApp.formatNumber(price);
		
		sident.appendChild(sdesc);
		sident.appendChild(sprice);
		
		var ssname = document.createElement("DIV"); // name - id
		ssname.style.clear = 'both';
		
		var sname = document.createElement("DIV");
		sname.setAttribute('class', 'productName');
		sname.textContent = 'name: ' + name + ' - id: ' + id;
		
		ssname.appendChild(sname);
		
		var dfoot = document.createElement("DIV"); // stock - buttons
		dfoot.style.clear = 'both';
		
		var sstock = document.createElement("DIV");
		sstock.setAttribute('class', 'productStock');
		sstock.textContent = stock?stock + ' units on stock.':'out of stock';
		
		var dbuttons = document.createElement("DIV");
		dbuttons.style.paddingTop = '10px';
		dbuttons.style.textAlign = 'right';
		for(var i = 0; i < buttons.length; i++){
			dbuttons.appendChild(buttons[i].render());
		}

		dfoot.appendChild(sstock);
		dfoot.appendChild(dbuttons);
		
		dprod.appendChild(sident);
		dprod.appendChild(ssname);
		dprod.appendChild(dfoot);
		
		$(dprod).hover(highlightIn, highlightOut);
		
		$(dprod).click(function(){
			if(selected){
				unselect();
			}else{
				select();
			}
		});
		
		dom = dprod;
		
		return dprod;
	};

	that.setBaseColor = function(color){
		baseColor = color;
		
		applyColor(color);
	};
	
	that.applyColor = function(color){
		return applyColor(color);
	};
	
	var animColor = function(col1, col2, steps, mills, callback){
		if(dom && col1 && col2){
			var cols = storeApp.getColorTransitions([col1, col2], steps);
			steps = steps || 10;
			mills = mills || 10;
			if(currentAnim && currentAnim.timeout) window.clearTimeout(currentAnim.timeout);
			
			var fx = function(){
				applyColor(cols[currentAnim.calls]);
				
				if(currentAnim.calls < currentAnim.steps){
					currentAnim.timeout = window.setTimeout(currentAnim.step, mills);
					currentAnim.calls += 1;
				}else{
					currentAnim.timeout = null;
					
					if(typeof callback === 'function'){
						callback();
					}
				}
			};
			
			currentAnim = {
				step: fx,
				calls: 0,
				steps: steps,
				timeout: window.setTimeout(fx, mills)
			};
		}
	};
	
	var highlightNew = function(){
		animColor(highColor, baseColor, 20, 50);
	};
	
	that.highlightNew = function(){
		return highlightNew();
	};
	
	var highlightIn = function(){
		animColor(currentColor, storeApp.addColor(selected?highColor:currentColor, 50, 50, 50), 20);
	};
	
	that.highlightIn = function(){
		return highlightIn();
	};
	
	var highlightOut = function(){
		animColor(currentColor, selected?highColor:baseColor, 20);
	};
	
	that.highlightOut = function(){
		return highlightOut();
	};
	
	var paintSelected = function(){
		animColor(currentColor, highColor, 20);
	};
	
	that.paintSelected = function(){
		return paintSelected();
	};
	
	var paintUnselected = function(){
		animColor(currentColor, baseColor, 10, 5);
	};
	
	that.paintUnselected = function(){
		return paintUnselected();
	};
	
	that.animToColor = function(col2, steps, mills, callback){
		animColor(currentColor, col2, steps, mills, callback);
	};
	
	that.setViewer = function(v){
		viewer = v;
	};
	
	that.getCurrentColor = function(){return currentColor;};
	that.select = function(){return select();};
	that.unselect = function(){return unselect();};
	that.isSelected = function(){return selected;};
	that.del = function(){return del();};
	that.edit = function(){return edit();};
	that.getId = function(){return id;};
	that.getName = function(){return name;};
	that.getPrice = function(){return price;};
	that.getDescription = function(){return description;};
	that.getStock = function(){return stock;};
	that.getDom = function(){return dom;};
	
	that.getSortableFields = function(){
		return [{name: 'id', getter: 'getId'}, {name: 'name', getter: 'getName'}, {name: 'price', getter: 'getPrice'}, {name: 'description', getter: 'getDescription'}, {name: 'stock', getter: 'getStock'}];
	};
	
	that.compareTo = function(b, sortingField){
		return this[sortingField] > b[sortingField]? 1 : this[sortingField] == b[sortingField]? 0: -1;
	};
	
	return that;
};

storeApp.dialog = function(dialog){
	var that = {};
	dialog = dialog || {};
	
	var id = dialog.id || 'dialog' + (new Date().getTime()+'').slice(-2);
	var dom = null;
	var hdom = null;
	var title = dialog.title || message;
	var basecolor = dialog.basecolor || '#818181';
	var message = dialog.message || 'message';
	var acceptButton = storeApp.button({text:'accept', id:'btnAcceptDialog', baseColor: '#818181', handler: function(){
		if(dom){
			dom.parentElement.removeChild(dom);
		}
	}});
	
	var applyColor = function(color){
		basecolor = color;
		var back = 'linear-gradient(' + storeApp.addColor(basecolor, 42, 13, 13) + ' 0%, ' + storeApp.addColor(basecolor, 99, 131, 105) + ' 15%, ' + basecolor + ' 70%, ' + storeApp.addColor(basecolor, 71, 33, 33) + ' 100%)';
		if(hdom){
			hdom.style.background = back;
		}
		return back;
	};
	
	that.render = function(){
		var dcont = document.createElement('DIV'); //modal - form
		dcont.setAttribute('id', 'cont' + id);
		
		var dmodal = document.createElement('DIV');
		dmodal.setAttribute('id', 'modal' + id);
		dmodal.setAttribute('class', 'modal');
		dmodal.style.zIndex = 25;
		
		var ddialog = document.createElement('DIV');
		ddialog.setAttribute('class', 'dialog');
		ddialog.style.left = document.body.clientWidth / 2 - 150 + 'px';
		
		var dheader = document.createElement('DIV'); //header
		dheader.setAttribute('class', 'dheader');
		
		var dhcont = document.createElement('DIV');
		dhcont.textContent = title;
		dhcont.setAttribute('class', 'noselect');
		dhcont.style.background = applyColor(basecolor);
		
		dheader.appendChild(dhcont);
		
		var dmessage = document.createElement('DIV'); //message
		dmessage.setAttribute('class', 'dialogMessage');
		dmessage.textContent = message;
		
		ddialog.appendChild(dheader);
		ddialog.appendChild(dmessage);
		ddialog.appendChild(acceptButton.render());
		
		dcont.appendChild(dmodal);
		dcont.appendChild(ddialog);
		
		dom = dcont;
		hdom = dhcont;
		
		return dcont;
	};
	
	that.applyColor = function(color){return applyColor(color);};
	
	return that;
};

storeApp.showDialog = function(ops){
	var d = this.dialog(ops);
	document.body.appendChild(d.render());
};

storeApp.form = function(form){
	var that = {};
	
	form = form || {};
	var title = form.title || 'form';
	var id = form.id || 'form' + (new Date().getTime()+'').slice(-2);
	var dom = null;
	var hdom = null;
	var fields = [];
	var url = form.url;
	var method = form.method;
	var submitButton = form.button;
	var extraParams = form.extraParams || [];
	var cancelButton = storeApp.button({text:'cancel', id:'btnCancelCreate', baseColor: '#818181', handler: function(){
		if(dom){
			dom.parentElement.removeChild(dom);
		}
	}});
	var basecolor = form.basecolor || '#818181';
	
	var addField = function(f){
		f = f || {};
		
		var field = {};
		
		field.id = f.id || 'field' + fields.length;
		field.label = f.label || 'field';
		field.validator = f.validator;
		field.maxLength = f.maxLength || 200;
		field.submitParam = f.submitParam;
		field.isValid = function(){
			return this.validator.test(this.value);
		};
		
		fields.push(field);
	};
	
	for(var i = 0; i < form.fields.length; i++){
		addField(form.fields[i]);
	}
	
	var applyColor = function(color){
		basecolor = color;
		var back = 'linear-gradient(' + storeApp.addColor(basecolor, 42, 13, 13) + ' 0%, ' + storeApp.addColor(basecolor, 99, 131, 105) + ' 15%, ' + basecolor + ' 70%, ' + storeApp.addColor(basecolor, 71, 33, 33) + ' 100%)';
		if(hdom){
			hdom.style.background = back;
		}
		return back;
	};
	
	var afterSubmit = form.afterSubmit || function(data, form){
		console.log('form sent correctly, response: ' + data);
	};
	
	var send = function(params){
		$.ajax({
			url: url + '?' + params.join('&'),
			method: method,
			contentType: 'application/json;charset=UTF-8',
			dataType: 'json',
			success: function(data){
				if(data > 0){
					afterSubmit(data, that);
				}
			},
			error: function(ex, text, error){
				storeApp.showDialog({id: 'dialogError', title: 'Error', message: ex.responseJSON.message, basecolor: '#990000'});
			}
		});
	};
	
	submitButton.setHandler(function(){
		var params = extraParams.slice() || [];
		
		for(var i = 0; i < fields.length; i++){
			if(!fields[i].submitParam) console.err('field ' + field[i].id + ' has no submitValue');
			
			if(fields[i].value){
				if(fields[i].isValid()){
					params.push((fields[i].submitParam || fields[i].id) + '=' + fields[i].value);
				}else{
					storeApp.showDialog({id: 'dialogError', title: 'Error', message: 'field ' + fields[i].label + ' has an invalid value.', basecolor: '#990000'});
					return;
				}
			}
		}
		
		if(form.send){
			form.send(params, that);
		}else{
			send(params);
		}
	});
	
	that.render = function(){
		var dcont = document.createElement('DIV'); //modal - form
		dcont.setAttribute('id', 'cont' + id);
		
		var dmodal = document.createElement('DIV');
		dmodal.setAttribute('id', 'modal' + id);
		dmodal.setAttribute('class', 'modal');
		
		var dform = document.createElement("DIV"); //header
		dform.setAttribute('id', id);
		dform.setAttribute('class', 'form');
		dform.style.left = document.body.clientWidth / 2 - 200 + 'px';
		
		var dheader = document.createElement('DIV');
		dheader.setAttribute('id', 'header' + id);
		dheader.setAttribute('class', 'dheader');
		
		var dhcont = document.createElement('DIV');
		dhcont.textContent = title;
		dhcont.style.background = applyColor(basecolor);
		
		dheader.appendChild(dhcont);
		
		hdom = dhcont;
		
		dform.appendChild(dheader);
		
		var renderField = function(f){
			var fcont = document.createElement('DIV');
			fcont.setAttribute('class', 'productFieldContainer');
			
			var flabel = document.createElement('LABEL');
			flabel.setAttribute('for', 'label' + f.id);
			flabel.setAttribute('class', 'productFieldLabel');
			flabel.textContent = f.label;
			
			var dfield = document.createElement('INPUT');
			dfield.setAttribute('id', 'field' + f.id);
			dfield.setAttribute('type', 'text');
			dfield.setAttribute('class', 'productField');
			dfield.setAttribute('maxLength', f.maxLength);
			dfield.onchange = function(){
				f.value = dfield.value;
				
				if(!f.validator.test(dfield.value)){
					$(dfield).addClass('invalidField');
				}else{
					$(dfield).removeClass('invalidField');
				}
			};
			
			fcont.appendChild(flabel);
			fcont.appendChild(dfield);
			
			f.dom = fcont;
			
			return fcont;
		};
		
		for(var i = 0; i < fields.length; i++){
			dform.appendChild(renderField(fields[i]));
		}
		
		var fcontbtn = document.createElement('DIV');
		fcontbtn.setAttribute('class', 'productFieldContainer form-button-container');
		fcontbtn.appendChild(submitButton.render());
		fcontbtn.appendChild(cancelButton.render());
		
		dform.appendChild(fcontbtn);
		
		dcont.appendChild(dmodal);
		dcont.appendChild(dform);
		
		dom = dcont;
		
		return dcont;
	};
	
	that.getDom = function(){return dom;};
	
	that.addField = function(f){return addField(f);};
	
	return that;
};