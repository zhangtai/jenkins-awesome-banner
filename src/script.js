document.addEventListener("DOMContentLoaded", function(event) {
    const targetTags = ["span", "a"]
    const banner = document.getElementById("systemmessage")

    const ATTR_RE = new RegExp(/^\{\:?[ ]*([^\}\n ][^\}\n]*)[ ]*\}/)
    const CUSTOM_ELEMENT_RE = new RegExp(/^\[\[?[ ]*([^\]\n ][^\]\n]*)[ ]*\]\]?[ ]*/)

    const parse = (re, doc) => {
        const search = re.exec(doc)
        if (!search) {
            return {match: "", exact: ""}
        }
        return {match: search[0], exact: search[1]}
    }
    
    const getAttrs = (attrsString) => {
        let attrs = []
        for (let attr of attrsString.split(" ")) {
            if (attr.startsWith(".")) {
                attrs.push({
                    type: "class",
                    name: attr.slice(1)
                })
            }
        }
        return attrs
    }

    const makeTag = (tagParam) => {
        let tag = document.createElement("span");
        tag.classList.add("tag")
        const {match, exact} = parse(ATTR_RE, tagParam)
        const attrs = getAttrs(exact)
        if (match) {
            for (let attr of attrs) {
                setAttr(tag, attr)
            }
        }
        const tagContent = tagParam.substring(match.length)
        tag.innerText = tagContent
        return tag
    }

    const makeTagGroup = (groupParamRaw) => {
        let control = document.createElement("div");
        let group = document.createElement("div")
        control.classList.add("control")
        group.classList.add("tags", "has-addons")
        const groupParam = groupParamRaw.split(":")
        for (let param of groupParam) {
            let tag = makeTag(param)
            group.appendChild(tag)
        }
        control.appendChild(group)
        return control
    }

    const createCustomElement = (name, paramsRaw) => {
        if (name == "tag-addons-group") {
            let wrapper = document.createElement("div");
            wrapper.classList.add("field", "is-grouped", "is-grouped-multiline")
            const params = paramsRaw.split("|")
            for (let param of params) {
                tagGroupControl = makeTagGroup(param)
                wrapper.appendChild(tagGroupControl)
            }
            return wrapper
        }
        return document.createElement("div")
    }

    const setAttr = (el, attr) => {
        if (attr.type === "class") {
            el.classList.add(attr.name)
        } else if (attr.type === "id") {
            el.id = attr.name
        }
    }

    for (let tag of targetTags) {
        for (let el of banner.getElementsByTagName(tag)) {
            const contentRaw = el.innerText
            const {match} = parse(ATTR_RE, contentRaw)
            if (match) {
                const contentWithoutAttrs = contentRaw.substring(match.length)
                const attrs = getAttrs(match)
                el.innerText = contentWithoutAttrs
                for (let attr of attrs) {
                    setAttr(el, attr)
                }
            }
        }
    }

    for (let cel of banner.getElementsByTagName("div")) {
        const contentRaw = cel.innerText
        const {match, exact} = parse(CUSTOM_ELEMENT_RE, contentRaw)
        if (match) {
            const celName = exact.trim()
            const params = contentRaw.substring(match.length)
            let element = createCustomElement(celName, params)
            cel.parentNode.replaceChild(element, cel)
        }
    }

    for (let child of banner.children) { 
        if (child.attributes.style?.value === 'border-width:20') {
            let infoDiv = child
            infoDiv.classList.add("columns")
            for (let column of infoDiv.children) {
                column.classList.add("column")
            }
        }
    }
})
