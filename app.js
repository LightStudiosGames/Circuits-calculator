function solve_line_equals(a) {
    if (a.length == 0) {
        return a
    }
    let n = a[0].length - 1
    for (let i = 0; i < n; ++i) {
        let ind = i
        while (ind < a.length && a[ind][i] == 0) {
            ++ind;
        }
        if (ind == a.length) {
            //Error
            return {}
        }
        [a[i], a[ind]] = [a[ind], a[i]]
        for (let j = i + 1; j < a.length; ++j) {
            let prod = a[j][i] / a[i][i]
            for (let k = 0; k <= n; ++k) {
                a[j][k] -= a[i][k] * prod
            }
        }
    }
    let ans = new Array(n)
    for (let i = n - 1; i >= 0; --i) {
        ans[i] = a[i][n]
        for (let j = i + 1; j < n; ++j) {
            ans[i] -= ans[j] * a[i][j]
        }
        ans[i] /= a[i][i]
    }
    return ans
}

let marked, graph, diod_opened
const min_r = 0.0000000001

function dfs(v) {
    marked[v] = true
    for (let u of graph[v]) {
        if (!marked[u]) {
            dfs(u)
        }
    }
}

function backend_without_diods(edges, n) {
    marked = new Array(n)
    graph = new Array(n)
    let in_i = new Array(n)
    let out_i = new Array(n)
    for (let i = 0; i < n; ++i) {
        marked[i] = false
        graph[i] = []
        in_i[i] = []
        out_i[i] = []
    }
	let m = edges.length;
	let a = new Array(n * 2 + m)
    for (let i = 0; i < n * 2 + m; ++i) {
        a[i] = new Array(n + m + 1)
        for (let j = 0; j < n + m + 1; ++j) {
            a[i][j] = 0
        }
    }
    let to_add_ind = 0
	for (let _ = 0; _ < m; ++_) {
		let x = edges[_].p1, y = edges[_].p2, t = edges[_].type;
		if ((t != 2) || (diod_opened[_])) {
			graph[x].push(y);
			graph[y].push(x);
		}
		let r = edges[_].r;
		let par = edges[_].par;
		out_i[x].push(_);
		in_i[y].push(_);
		if (t == 0 || t == 1 || t == 4) {
			//wire&resistor + ampermeter
			a[to_add_ind][x] = -1;
			a[to_add_ind][y] = 1;
			a[to_add_ind][n + _] = r;
            ++to_add_ind
		}
		if (t == 2) {
			if (diod_opened[_]) {
				//wire
				a[to_add_ind][x] = -1;
				a[to_add_ind][y] = 1;
				a[to_add_ind][n + _] = r;
			} else {
				//air
                graph[x].pop()
                graph[y].pop()
				a[to_add_ind][n + _] = 1;
			}
            ++to_add_ind
		}
        if (t == 3) {
            //voltmeter
            graph[x].pop()
            graph[y].pop()
            a[to_add_ind][n + _] = 1;
            ++to_add_ind;
        }
        if (t == 5) {
            //ohmmeter
			a[to_add_ind][x] = -1
			a[to_add_ind][y] = 1
			a[to_add_ind][n + m] = 1
			a[to_add_ind][n + _] = r
            ++to_add_ind
		}
		if (t == 6) {
			//source
			a[to_add_ind][x] = -1
			a[to_add_ind][y] = 1
			a[to_add_ind][n + m] = par
			a[to_add_ind][n + _] = r
            ++to_add_ind
		}
	}
	for (let i = 0; i < n; ++i) {
		if (!marked[i]) {
            a[to_add_ind][i] = 1
            ++to_add_ind
			dfs(i)
		}
	}
	for (let i = 0; i < n; ++i) {
		for (let x of in_i[i]) {
			a[to_add_ind][n + x] = 1
		}
		for (let x of out_i[i]) {
			a[to_add_ind][n + x] = -1
		}
        ++to_add_ind
	}
	return solve_line_equals(a)
}


function backend(edges, n) {
    if (n == 0) {
        return new Array(0)
    }
    diod_opened = new Array(edges.length)
    for (let i = 0; i < edges.length; ++i) {
        diod_opened[i] = true
    }
	let ans = backend_without_diods(edges, n)
	for (let i = 0; i < edges.length; ++i) {
		if (edges[i].type == 2) {
			if (ans[n + i] < 0) {
				diod_opened[i] = false
			}
		}
	}
	return backend_without_diods(edges, n);
}

class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

function less(a, b) {
    return new Point(a.x - b.x, a.y - b.y)
}

function sum(a, b) {
    return new Point(a.x + b.x, a.y + b.y)
}

function prod(a, b) {
    return new Point(a.x * b, a.y * b)
}

function dist(a, b) {
    return ((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y)) ** 0.5
}

function normalize(a) {
    return prod(a, 1 / dist(ZeroPoint, a))
}

function getTextPos(a) {
    return 'translate(' + a.x + 'px, ' + a.y + 'px)'
}

function equals(a, b) {
    return (dist(a, b) < 0.01)
}

function hsh(a) {
    return a.x + a.y * 100000;
}

class Element_ind {
    constructor(p1, p2, type_, r, par) {
        this.p1 = p1
        this.p2 = p2
        this.type = type_
        this.r = r
        if ((this.type == 6 || this.type == 5) && r < min_r) {
            //Source
            this.r = min_r
        }
        this.par = par
    }
}

class Action {
    constructor(type_, par, e) {
        this.type = type_
        this.par = par
        this.e = e
    }
}

class Element {
    constructor(p1, p2, type_) {
        this.p1 = p1
        this.p2 = p2
        this.type = type_
        this.r = 0
        this.par = 0
        if (type_ == 0) {

        } else if (type_ == 1) {
            this.r = 1
        } else if (type_ == 2) {

        } else if (type_ == 3) {

        } else if (type_ == 4) {

        } else if (type_ == 5) {

        } else if (type_ == 6) {
            this.par = 1
        }
    }
}

let ZeroPoint = new Point(0, 0)
let area = document.getElementById("area")

let selected = -1, temp = -1, bar_wight = 300, line_dist = 50, opened_element = -1
let clicked_spot = new Point(-1, -1), mouse_pos = new Point(-1, -1)

let icons = ["Icons/Wire.jpg", "Icons/Resistor.jpg", "Icons/Diod.jpg", "Icons/VoltMeter.jpg", "Icons/AmperMeter.jpg", "Icons/OhmMeter.jpg", "Icons/Source.jpg"]
let bold_icons = ["Icons/Wire_bold.jpg" ,"Icons/Resistor_bold.jpg", "Icons/Diod_bold.jpg", "Icons/VoltMeter_bold.jpg", "Icons/AmperMeter_bold.jpg", "Icons/OhmMeter_bold.jpg", "Icons/Source_bold.jpg"]
let icon_names = ["Wire", "Resistor", "Diod", "VoltMeter", "AmperMeter", "OhmMeter", "Source"]
let elements = [], back_end_list
let actions = [], cords = new Map()

let WireSelector = document.getElementById("selectWire"), ResistorSelector = document.getElementById("selectResistor"), DiodSelector = document.getElementById("selectDiod")
let VoltSelector = document.getElementById("selectVolt"), AmperSelector = document.getElementById("selectAmper"), OhmSelector = document.getElementById("selectOhm")
let SourceSelector = document.getElementById("selectSource")

let elements_cnt = new Point(0, 0)

// window.onbeforeunload = function(evt) {
//     evt = evt || window.event;
//     evt.returnValue = "Вы же ничего не сохранили!";
// }

function check(e) {
    return (e.x < 100 && e.y < 5)
}

function count_elements(e, plus) {
    let ans = new Point(1, 0)
    if (e.type == 2) {
        ans.y = 1
    }
    let elements_cnt_testing = sum(elements_cnt, ans)
    if (check(elements_cnt_testing)) {
        elements_cnt = elements_cnt_testing
        return true
    }
    //
    return false
}

function select(i) {
    if (selected == i) {
        selected = -1
    } else {
        selected = i
    }
    update()
    return true
}

function get_text(a) {
    a = Math.abs(a)
    if (a >= 1000000000) {
        return "inf"
    }    let a_ = a * (10 ** 3)
    a_ = a_.toFixed(2)
    a = a_ / (10 ** 3)
    return a
}

function draw_element(e, ind) {
    if (e.p1 == e.p2) {
        return;
    }
    let p1 = new Point(bar_wight + e.p1.x * line_dist, e.p1.y * line_dist), p2 = new Point(bar_wight + e.p2.x * line_dist, e.p2.y * line_dist)
    p1 = sum(p1, new Point(1, 1))
    p2 = sum(p2, new Point(1, 1))
    let mid = new Point(p1.x + p2.x, p1.y + p2.y)
    mid = prod(mid, 0.5)
    let dX = p2.x - p1.x
    let dY = p2.y - p1.y
    let rotation = (Math.atan2(dY, dX)) * 180 / 3.14159265
    let dist_sum = dist(p1, p2)
    let dist_ = (dist_sum - 50) / 2
    let v1 = normalize(less(mid, p1)), v2 = normalize(less(mid, p2))
    let v_prod = (50 + dist_sum) / 4

    v1 = prod(v1, v_prod)
    v2 = prod(v2, v_prod)
    let wire_mid_1 = sum(mid, v1), wire_mid_2 = sum(mid, v2)
    let newElem = document.createElement("div")
    let newElemImage = document.createElement("img")
    newElemImage.src = icons[e.type]
    newElemImage.style.transform = 'rotate(' + rotation + 'deg)';
    let newElemWire1 = document.createElement("img"), newElemWire2 = document.createElement("img")
    newElemWire1.src = icons[0]
    newElemWire2.src = icons[0]
    if (ind != -1 && ind == opened_element) {
        newElemWire1.src = bold_icons[0]
        newElemWire2.src = bold_icons[0]
        newElemImage.src = bold_icons[e.type]
    }
    newElemWire1.style.position = 'absolute';
    newElemWire2.style.position = 'absolute';

    newElemWire1.style.height = '30px'
    newElemWire2.style.height = '30px'
    newElemWire1.style.width = dist_ + 'px'
    newElemWire2.style.width = dist_ + 'px'
    wire_mid_1 = less(wire_mid_1, new Point(dist_ / 2, 15))
    newElemWire1.style.transform = getTextPos(wire_mid_1)
    wire_mid_2 = less(wire_mid_2, new Point(dist_ / 2, 15))
    newElemWire2.style.transform = getTextPos(wire_mid_2)
    newElemWire1.style.transform += ' rotate(' + rotation + 'deg)'
    newElemWire2.style.transform += ' rotate(' + rotation + 'deg)'

    newElemImage.style.position = 'absolute';
    newElemImage.style.transform = getTextPos(less(mid, new Point(25, 15)))
    newElemImage.style.transform += ' rotate(' + rotation + 'deg)';
    newElemWire1.className = "element"
    newElemWire1.id = "ind " + ind
    newElemWire2.className = "element"
    newElemWire2.id = "ind " + ind
    newElemImage.className = "element"
    newElemImage.id = "ind " + ind
    let newElemText = document.createElement("p")
    newElemText.style.transform = getTextPos(sum(mid, new Point(0, -70)))
    newElemText.style.color = '#ff9900'
    newElemText.style.position = 'absolute';
    newElemText.style.fontSize = '20px'
    if (ind != -1) {
        if (e.type == 3) {
            //Volt
            newElemText.textContent = get_text(back_end_list[cords.get(hsh(e.p1))] - back_end_list[cords.get(hsh(e.p2))])
        }
        if (e.type == 4) {
            //Amper
            newElemText.textContent = get_text(back_end_list[temp + ind])
        }
        if (e.type == 5) {
            //Ohm
            newElemText.textContent = get_text(1/back_end_list[temp + ind])
        }
    }
    newElem.appendChild(newElemText)
    newElem.appendChild(newElemWire1)
    newElem.appendChild(newElemImage)
    newElem.appendChild(newElemWire2)
    area.appendChild(newElem)
}

function get_div(txt, val, txt_id) {
    let div = document.createElement("div")
    div.style.display = "flex"
    div.innerHTML = "<h3 style='margin-top: 18px;'>" + txt + "</h3>"
    let elem = document.createElement("input")
    elem.type = "number"
    if (txt_id == "I_input") {
        elem.type = "text"
    }
    elem.value = val
    elem.style.marginLeft = "15px"
    elem.id = txt_id
    div.appendChild(elem)
    return div
}

function update() {
    WireSelector.src = icons[0]
    ResistorSelector.src = icons[1]
    DiodSelector.src = icons[2]
    VoltSelector.src = icons[3]
    AmperSelector.src = icons[4]
    OhmSelector.src = icons[5]
    SourceSelector.src = icons[6]
    if (selected == 0) {
        WireSelector.src = bold_icons[0]
    }
    if (selected == 1) {
        ResistorSelector.src = bold_icons[1]
    }
    if (selected == 2) {
        DiodSelector.src = bold_icons[2]
    }
    if (selected == 3) {
        VoltSelector.src = bold_icons[3]
    }
    if (selected == 4) {
        AmperSelector.src = bold_icons[4]
    }
    if (selected == 5) {
        OhmSelector.src = bold_icons[5]
    }
    if (selected == 6) {
        SourceSelector.src = bold_icons[6]
    }
    area.innerHTML = ""
    for (let i = 0; i < elements.length; ++i) {
        draw_element(elements[i], i)
    }
    if (clicked_spot.x != -1 && !equals(clicked_spot, mouse_pos)) {
        draw_element(new Element(clicked_spot, mouse_pos, selected), -1)
    }
    if (opened_element != -1) {
        document.getElementById("I_input").value = get_text(back_end_list[temp + opened_element])
    }
}

function update_window() {
    let window = document.getElementById("info");
    window.innerHTML = ""
    if (opened_element != -1) {
        let name_elem = document.createElement("h1")
        name_elem.textContent = icon_names[elements[opened_element].type]
        name_elem.style.marginLeft = "20px"
        window.appendChild(name_elem)
        // let i_elem = document.createElement("h3")
        // i_elem.textContent = "I " + get_text(back_end_list[temp + opened_element])
        // i_elem.id = "i_elem"
        // i_elem.style.marginLeft = "15px"
        // window.appendChild(i_elem)
        let i_div = get_div("I =", get_text(back_end_list[temp + opened_element]), "I_input")
        i_div.style.marginLeft = "15px"
        window.appendChild(i_div)
        if (elements[opened_element].type != 3 && elements[opened_element].type != 4 && elements[opened_element].type != 5) {
            let r_div = get_div("R =", elements[opened_element].r, "R_input")
            r_div.style.marginLeft = "15px"
            window.appendChild(r_div)
            if (elements[opened_element].type == 6) {
                let par_div = get_div("E =", elements[opened_element].par, "Par_input")
                par_div.style.marginLeft = "15px"
                window.appendChild(par_div)
            }
        }
        let del_button = document.createElement("button")
        del_button.id = "del_button"
        del_button.textContent = "delete"
        window.appendChild(del_button)
    }
}

document.oninput = function(e) {
    let value = (Number)(e.target.value)
    if (e.target.id == "R_input") {
        elements[opened_element].r = value
    }
    if (e.target.id == "Par_input") {
        elements[opened_element].par = value
    }
    count_i()
}

document.addEventListener('keypress', function (e) {  
    if (e.ctrlKey && (e.which || e.keyCode) == 26) {
        if (actions.length > 0) {
            let a = actions[actions.length - 1]
            actions.pop()
            if (a.type == 0) {
                if (opened_element >= a.par) {
                    --opened_element
                }
                count_elements(elements[a.par], false)
                elements.splice(a.par, 1)
            } else if (a.type == 1) {
                count_elements(a.e, true)
                if (opened_element >= a.par) {
                    ++opened_element
                }
                elements.splice(a.par, 0, a.e)
            }
            count_i()
        }
    }
})

function count_i() {
    let edges = [];
    cords = new Map();
    temp = 0;
    for (let e of elements) {
        if (!cords.has(hsh(e.p1))) {
            cords.set(hsh(e.p1), temp)
            ++temp;
        }
        if (!cords.has(hsh(e.p2))) {
            cords.set(hsh(e.p2), temp)
            ++temp;
        }
        edges.push(new Element_ind(cords.get(hsh(e.p1)), cords.get(hsh(e.p2)), e.type, e.r, e.par));
    }
    back_end_list = backend(edges, temp);
    update()
}

WireSelector.addEventListener('click', function () { return select(0) })
ResistorSelector.addEventListener('click', function () { return select(1) })
DiodSelector.addEventListener('click', function () { return select(2) })
VoltSelector.addEventListener('click', function () { return select(3) })
AmperSelector.addEventListener('click', function () { return select(4) })
OhmSelector.addEventListener('click', function () { return select(5) })
SourceSelector.addEventListener('click', function () { return select(6) })

function get_cell(spot) {
    spot = less(spot, new Point(bar_wight, 0))
    let cell = prod(spot, 1 / line_dist)
    cell.x = Math.round(cell.x)
    cell.y = Math.round(cell.y)
    return cell
}

document.onmousemove = function (e) {
    if (selected != -1) {
        if (!equals(clicked_spot, new Point(-1, -1))) {
            let cell = get_cell(new Point(e.clientX, e.clientY))
            if (cell.x > 0 && cell.y > 0 && e.clientX < window.innerWidth - bar_wight) {
                mouse_pos = cell
            } else {
                clicked_spot = new Point(-1, -1)
            }
            update()
        }
    }
}

document.onmousedown = function (e) {
    if (e.button == 0) {
        if (e.target.id == "del_button") {
            actions.push(new Action(1, opened_element, elements[opened_element]))
            count_elements(elements[opened_element], false)
            elements.splice(opened_element, 1)
            opened_element = -1
            update_window()
            count_i()
        }
        if (selected != -1) {
            let cell = get_cell(new Point(e.clientX, e.clientY))
            let p = new Point(bar_wight + cell.x * line_dist, cell.y * line_dist)
            if (cell.x > 0 && cell.y > 0 && p.x < window.innerWidth - bar_wight) {
                if (equals(clicked_spot, new Point(-1, -1))) {
                    clicked_spot = cell
                } else {
                    if (!equals(clicked_spot, cell)) {
                        if (count_elements(new Element(clicked_spot, cell, selected), true)) {
                            actions.push(new Action(0, elements.length, -1))
                            elements.push(new Element(clicked_spot, cell, selected))
                        }
                        clicked_spot = new Point(-1, -1)
                        count_i()
                    }
                }
            }
        }
    }
}

document.oncontextmenu = function(event) {
    event.preventDefault();
    if (event.target.className == "element") {
        let ind = parseInt(event.target.id.slice(3))
        if (ind != -1) {
            opened_element = ind;
            update_window()
            update()
        }
    }
}