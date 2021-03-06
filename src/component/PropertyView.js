/**
 * 属性面板
 */

import React from 'react';
import ReactDOM from 'react-dom';
import  $ from 'jquery';
import { Form, Input, InputNumber, Slider, Switch, Collapse,Select,Dropdown,Menu,Button} from 'antd';
const Option = Select.Option;
const Panel = Collapse.Panel;
const MenuItem = Menu.Item;
import cls from 'classnames';
import { SwitchMore,DropDownInput ,ConInputNumber,ConButton} from  './PropertyView/PropertyViewComponet';
import WidgetStore, {dataType} from '../stores/WidgetStore';
import WidgetActions from '../actions/WidgetActions';
import {propertyType, getPropertyMap,sortGroupArr,fnIsFlex,fnIsUnderTimer} from './PropertyMap'
import {chooseFile} from  '../utils/upload';
require("jscolor/jscolor");
import TbCome from './TbCome';
import {PropertyViewMove} from  './PropertyView/MoudleMove';
import DbHeaderStores from '../stores/DbHeader';
import EffectAction from '../actions/effectAction';
import EffectStore from '../stores/effectStore';

class PropertyView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded:props.expanded,
            fields: null,
            propertyName:null,
            sockName : null,
            tbHeadHeight: 0,
            tbHeaderToggle : true,
            tbWhichColumn : 0,
            tbLineWidth : "自动",
            isSliderChange : false,
            dbList: [],
            AllDbList : [],
            effectList : []
        };
        this.moudleMove=null;
        this.selectNode = null;
        this.currentPage = null;
        this.fontList=[];
        this.fontFamilyList=[
            {name:'黑体',file:'SimHei'},
            {name:'宋体',file:'SimSun'},
            {name:'新宋体',file:'NSimSun'},
            {name:'仿宋',file:'FangSong'},
            {name:'楷体',file:'KaiTi'},
            {name:'仿宋_GB2312',file:'FangSong_GB2312'},
            {name:'楷体_GB2312',file:'KaiTi_GB2312 '},
            {name:'微软雅黑体',file:'Microsoft YaHei'}
        ];
        this.textSizeObj=null;

        this.defaultData = {
            width: null,
            height: null
        };
        this.originPos={
            x:null,
            y:null
        };
        this.lastSelectKey = null;
        this.isCanKeepRatio = true;
        this.tbComeShow = this.tbComeShow.bind(this);
        this.tbHeadHeight = this.tbHeadHeight.bind(this);
        this.tbHeadHeightInput = this.tbHeadHeightInput.bind(this);
        this.tbLineWidthInput = this.tbLineWidthInput.bind(this);
        this.tbLineWidth = this.tbLineWidth.bind(this);
        this.sliderUp = this.sliderUp.bind(this);
        this.sliderChange = this.sliderChange.bind(this);
        this.effectToggleTrack = this.effectToggleTrack.bind(this);

        this.setUpDefaultInputBackground = this.setUpDefaultInputBackground.bind(this);
    }

    setUpDefaultInputBackground(dom, defaultData, item, node){
        //文字设定
        dom.value = node.props[item.name]===undefined
            ?defaultData.placeholder
            :(node.props[item.name]=='transparent')?'无':node.props[item.name];
        //背景设定
        if(node.props[item.name]=='transparent') {
            dom.style.backgroundColor='transparent';
            dom.style.color='#858585';
        } else {
            dom.style.backgroundColor = node.props[item.name] ? node.props[item.name] : 'transparent';
            dom.style.color= node.props[item.name] ? 'black' : '#858585';
        }
    }

    //获取封装的form组件
    getInputBox(type,defaultProp,item,cNode) {
        let node = this.selectNode;
        if(cNode&&node.props.block) {
            node = cNode;
        }
        let style = {};
        let defaultData =  defaultProp;
        switch (type) {
            case propertyType.Integer:
                if(defaultProp.tbCome == "tbS"){
                    delete defaultData.tbCome;
                    return <ConInputNumber  {...defaultData}/>;
                }
                else {
                    return <ConInputNumber {...defaultProp} />;
                }
            case propertyType.Float:
                return <ConInputNumber {...defaultProp}  />;
            case propertyType.Button:
                defaultProp.item=item;
                defaultProp.curNode=this.selectNode;
                return <ConButton {...defaultProp} effectToggleTrack={this.effectToggleTrack} />;
            case propertyType.Number:
                let step=1;
                if(['totalTime','startTime','endTime','delay'].indexOf(defaultProp.name)>0){
                    step=0.1;
                }
                if(defaultProp.tbCome == "tbS"){
                    style['width'] = "58px";
                    style['height'] = "22px";
                    style['lineHeight'] = "22px";
                    //console.log(defaultProp);
                    delete defaultData.tbCome;
                    return <ConInputNumber  {...defaultData} style={style} />;
                }
                else {
                    return <ConInputNumber  step={step} {...defaultProp}  />;
                }
            case propertyType.Percentage:
                return  <div>
                            <ConInputNumber  step={1} max={100} min={0}  {...defaultProp}  className='slider-input' />
                            <Slider step={1}
                                    max={100}
                                    min={0}
                                    {...defaultProp}
                                    className='slider-per'
                                    onChange = { this.sliderChange.bind(this, node) }
                                    onAfterChange={ this.sliderUp.bind(this, node) } />
                        </div>;

            case propertyType.Text:
                return <Input type="textarea" {...defaultProp} />;

            case propertyType.Color:
                return <div>
                    <Input ref={(inputDom) => {
                        if (inputDom) {
                            var dom = ReactDOM.findDOMNode(inputDom).firstChild;
                            this.setUpDefaultInputBackground(dom, defaultData, item, node);
                            if (!dom.jscolor) {
                                dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                                dom.jscolor.onFineChange = defaultProp.onChange;
                                dom.jscolor.closeText='jsColorCloseBtn';
                            }
                        }
                    }} {...defaultProp}   className='color-input' />
                    <Switch       {...defaultProp}      className='visible-switch ant-switch-small' />
                </div>;
            case propertyType.Color2:
                if(defaultProp.tbCome){
                    delete defaultData.tbCome;
                }
                return  <Input ref={(inputDom) => {
                    //这个属性很奇怪,显示值要在这内部设定
                    if (inputDom) {
                        var dom = ReactDOM.findDOMNode(inputDom).firstChild;
                        this.setUpDefaultInputBackground(dom, defaultData, item, node);
                        if (!dom.jscolor) {
                            dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                            dom.jscolor.onFineChange = defaultProp.onChange;
                            dom.jscolor.closeText='jsColorCloseBtn';
                        }

                    }
                }}  {...defaultData}   /> ;

            case propertyType.Boolean:
                defaultProp.defaultChecked=defaultProp.checked;
                return <Switch   {...defaultProp} />;
            case propertyType.Boolean2:
                defaultProp.defaultChecked=defaultProp.checked;
                return <SwitchMore   {...defaultProp} />;
            case propertyType.Select:
                if(defaultProp.tbCome == "tbF"){
                    style['width'] = "125px";
                    style['maxWidth'] = "125px";
                }
                return <div className={cls({"flex-1": defaultProp.tbCome == "tbF"})}>
                    <Select {...defaultProp} style={style}>
                        {defaultProp.options}
                    </Select>
                    <div id={cls({'ant-progress':defaultProp.name=='fontFamily'})}>
                        <div className='ant-progress-bar'></div>
                        <div className='ant-progress-txt'>上传 10%</div>
                    </div>
                </div>;
            case propertyType.TbSelect:
                //console.log(defaultProp.tbWidth,this.state.tbLineWidth);
                return  <div className="f--hlc">
                    <div className="flex-1">
                        <Select {...defaultProp}>
                            {defaultProp.options}
                        </Select>
                    </div>

                    <div style={{ width: "58px", marginLeft: "3px", position:"relative"}}>
                        <Input value={ this.state.tbLineWidth }
                               onChange={ this.tbLineWidthInput.bind(this) }
                               onBlur={ this.tbLineWidth.bind(this, node) }
                               style={{height:"22px",padding:"0 7px"}} />
                        <span className="TbSelect-icon" />
                    </div>
                </div>;

            case propertyType.TbColor :
                return  <div className="f--hlc">
                    <div className="flex-1">
                        <Input
                            ref={(inputDom) => {
                                if (inputDom) {
                                    var dom = ReactDOM.findDOMNode(inputDom).firstChild;
                                    this.setUpDefaultInputBackground(dom, defaultData, item, node);
                                    if (!dom.jscolor) {
                                        dom.jscolor = new window.jscolor(dom, {hash:true, required:false});
                                        dom.jscolor.onFineChange = defaultProp.onChange;
                                        dom.jscolor.closeText='jsColorCloseBtn';
                                    }
                                }
                            }}
                            placeholder={defaultProp.placeholder}
                            style={{height:"22px",padding:"0 7px", position:"relative"}}
                            className='color-input' />
                    </div>

                    <div style={{ width: "58px", marginLeft: "3px",height:"22px" }}>
                        <Input placeholder={ defaultProp.tbHeight }
                               onChange={ this.tbHeadHeightInput.bind(this) }
                               onBlur={ this.tbHeadHeight.bind(this, node) }
                               style={{height:"22px",padding:"0 7px"}} />
                        <span className="TbColor-icon" />
                    </div>
                </div>;
            case propertyType.TdLayout :
                return  <div className="f--hlc TdLayout">
                    <span className={cls({"active": defaultProp.placeholder.indexOf(1) >=0 })} />
                    <span className={cls({"active": defaultProp.placeholder.indexOf(2) >=0 })} />
                    <span className={cls({"active": defaultProp.placeholder.indexOf(3) >=0 })} />
                    <span className={cls({"active": defaultProp.placeholder.indexOf(4) >=0 })} />
                </div>;
            case propertyType.Dropdown:
                return  <DropDownInput {...defaultProp} />;
            case propertyType.Button2:
                if(defaultProp.name=='bgLink'){
                    defaultProp.onClick=defaultProp.onChange;
                    delete  defaultProp.onChange;
                }
                return <div className="pr">
                    <Button  {...defaultProp} >{defaultProp.value}</Button>
                    {
                        defaultProp.value=='上传图片'
                            ?''
                            :  <div className={cls('btn_del')} onClick={defaultProp.onClick}></div>
                    }
                      <div id={cls({'ant-progress':defaultProp.name=='bgLink'})}>
                           <div className='ant-progress-bar'></div>
                           <div className='ant-progress-txt'>上传 10%</div>
                     </div>
                </div>
            case propertyType.dbSelect:
                if(!defaultProp.value){
                    defaultProp.value = null;
                }
                return <div className="flex-1">
                    <Select {...defaultProp}>
                        <Option value={null} key={0}>无数据源</Option>
                        {
                            this.state.dbList.map((v, i)=>{
                               return <Option value={v.id} key={i+1}>{v.name}</Option>
                            })
                        }
                    </Select>
                </div>;
            default:
                return <Input {...defaultProp} />;
        }
    }

    onChangeProp(prop, cNode, value) {
        let v;
        let node = this.selectNode;
        if(cNode&&node.props.block) {
            node = cNode;
        }
        //let
        var bTag = true; //开关,控制执行
        if (value === undefined) {
            v = null;
        } else {
            switch (prop.type) {
                case propertyType.Integer:
                    if (prop.name == 'size') {
                        v = parseInt(value);
                        const obj = {};
                        obj[prop.name] = v;
                        obj.scaleY = obj.scaleX = 1;
                        delete node.node.defaultData;
                        this.onStatusChange({updateProperties: obj, changeNode:node});
                        WidgetActions['updateProperties'](obj, false, true, undefined, node);
                        bTag = false;
                        break;
                    } else if (prop.name == 'shapeWidth' || prop.name == 'shapeHeight') {
                        v = parseInt(value);
                        node.props.height = node.props.width = null;
                        const obj = {};
                        obj[prop.name] = v;
                        obj.scaleY = obj.scaleX = 1;
                        delete node.node.defaultData;
                        this.onStatusChange({updateProperties: obj, changeNode:node});
                        WidgetActions['updateProperties'](obj, false, true, undefined, node);
                        bTag = false;
                        break;
                    }
                    else if(fnIsFlex(node)){
                        let obj={};
                        obj[prop.name] =  parseInt(value);
                        WidgetActions['updateProperties'](obj, false, false, undefined, node);
                        bTag = false;
                        break;
                    }
                    v = parseInt(value);
                    break;
                case propertyType.Number:
                    if (prop.name == 'fontSize' || prop.name == 'headerFontSize') {
                        let obj = {};
                        obj[prop.name] = parseInt(value);
                        obj.scaleY = obj.scaleX = 1;
                        delete node.node.defaultData;
                        this.onStatusChange({updateProperties: obj, changeNode:node});
                        WidgetActions['updateProperties'](obj, false, true, undefined, node);
                        bTag = false;
                        break;
                    }
                    else if(prop.name == 'totalTime' ){
                        node.props[prop.name+'Key'] = value;
                    }
                    else if (['marginUp','marginDown','marginLeft','marginRight'
                        ].indexOf(prop.name)>=0) {
                        node.props[prop.name+'Key'] = value;

                        //外间距一定是排在内间距前面
                        let index=0;
                        let $obj=$('#PropertyViewBody');
                        let a=   $($obj.find('.ant-form-item-label label:contains("边距上")')[index]).parents('.ant-form-item').find('.ant-input-number-input').val();
                        let b=   $($obj.find('.ant-form-item-label label:contains("边距下")')[index]).parents('.ant-form-item').find('.ant-input-number-input').val();
                        let c=   $($obj.find('.ant-form-item-label label:contains("边距左")')[index]).parents('.ant-form-item').find('.ant-input-number-input').val();
                        let d=   $($obj.find('.ant-form-item-label label:contains("边距右")')[index]).parents('.ant-form-item').find('.ant-input-number-input').val();

                        a=a||0;
                        b=b||0;
                        c=c||0;
                        d=d||0;
                        let obj={
                            margin:{marginUp:a,marginRight:d,marginDown:b,marginLeft:c}
                        };

                        this.onStatusChange({updateProperties: obj, changeNode:node});
                        WidgetActions['updateProperties'](obj, false, false, undefined, node);
                        bTag = false;
                    }
                    else if (['paddingUp','paddingDown','paddingLeft','paddingRight'
                        ].indexOf(prop.name)>=0) {
                        node.props[prop.name + 'Key'] = value;
                        let $obj=$('#PropertyViewBody');
                        let len =$obj.find('.ant-form-item-label label:contains("边距上")').length;
                        //内间距排在外间距后面
                        let index=len==1?0:1;
                        let a=   $($obj.find('.ant-form-item-label label:contains("边距上")')[index]).parents('.ant-form-item').find('.ant-input-number-input').val();
                        let b=   $($obj.find('.ant-form-item-label label:contains("边距下")')[index]).parents('.ant-form-item').find('.ant-input-number-input').val();
                        let c=  $($obj.find('.ant-form-item-label label:contains("边距左")')[index]).parents('.ant-form-item').find('.ant-input-number-input').val();
                        let d=   $($obj.find('.ant-form-item-label label:contains("边距右")')[index]).parents('.ant-form-item').find('.ant-input-number-input').val();

                        a=a||0;
                        b=b||0;
                        c=c||0;
                        d=d||0;
                        let obj={
                            padding:{paddingUp:a,paddingRight:d,paddingDown:b,paddingLeft:c}
                        }
                        this.onStatusChange({updateProperties: obj, changeNode:node});
                        WidgetActions['updateProperties'](obj, false, false, undefined, node);
                        bTag = false;
                    }
                        v = parseFloat(value);
                    break;
                case propertyType.Percentage:
                    v = (prop.name == 'alpha') ? parseFloat(value) / 100 : parseFloat(value);
                    break;
                case propertyType.Float:
                    let defaultWidth = node.node.defaultData.width;
                    let defaultHeight = node.node.defaultData.height;
                    if (node.node.keepRatio) {
                        //修改之前的宽度和高度
                        let oldWidth = node.node.width;
                        let oldHeight = node.node.height;
                        //修改后的宽度 和应该显示的高度
                        if ('scaleX' == prop.name) {
                            let obj = {}
                            obj.scaleX = parseInt(value) / defaultWidth;
                            obj.scaleY = ( oldHeight * value) / (oldWidth * defaultHeight);
                            this.onStatusChange({updateProperties: obj, changeNode:node});
                            WidgetActions['updateProperties'](obj, false, false, undefined, node);
                        } else if ('scaleY' == prop.name) {
                            let obj = {}
                            obj.scaleY = parseInt(value) / defaultHeight;
                            obj.scaleX = ( oldWidth * value) / (oldHeight * defaultWidth);
                            this.onStatusChange({updateProperties: obj, changeNode:node});
                            WidgetActions['updateProperties'](obj, false, false, undefined, node);
                        }
                        bTag = false;
                        break;
                    } else {
                        if ('scaleX' == prop.name) {
                            v = parseInt(value) / defaultWidth;
                            node.node.width = value;
                        } else if ('scaleY' == prop.name) {
                            v = parseInt(value) / defaultHeight;
                            node.node.height = value;
                        }
                    }
                    break;
                case propertyType.Dropdown:
                    if (prop.name == 'originPos') {
                        //数组
                     //   value.key = value.key.replace(/，/g, ',');
                        let arr = value.key.split(',');
                        let x = parseFloat(arr[0]);
                        let y = parseFloat(arr[1]);
                        let propsObj = node.props;
                        let nodeObj = node.node;
                        let oldOrigin = this.getOldOrigin(propsObj.originPosKey, prop.options);
                        let w = nodeObj.width * (x - parseFloat(oldOrigin[0]));
                        let h = nodeObj.height * (parseFloat(oldOrigin[1]) - y);
                        let D = Math.sqrt(h * h + w * w);
                        let d = null;
                        if (w == 0) {
                            if (h > 0) {
                                d = Math.PI / 2;
                            } else if (h == 0) {
                                return false;  //选择了同一中心点,不做任何操作
                            } else {
                                d = 3 * Math.PI / 2;
                            }
                        } else {
                            d = Math.atan(h / w);
                            if (h > 0 && w > 0) {
                                ;
                            } else if (h > 0 && w < 0) {
                                d = d + Math.PI;
                            } else if (h < 0 && w > 0) {
                                ;
                            } else if (h < 0 && w < 0) {
                                d = d + Math.PI ;
                            } else if (h == 0 && w > 0) {
                                ;
                            } else if (h == 0 && w < 0) {
                                d = Math.PI;
                            } else {
                                alert('bug!');
                            }
                        }
                        let ran = d - nodeObj.rotation * Math.PI / 180;
                        let posX = nodeObj.positionX + Math.cos(ran) * D;
                        let posY = nodeObj.positionY - Math.sin(ran) * D;
                        propsObj.originPosKey = this.getSelectDefault({x: x, y: y}, prop.options);
                        propsObj.originX = x;
                        nodeObj.originX = x;
                        propsObj.originY = y;
                        nodeObj.originY = y;

                        propsObj.positionX = posX;
                        nodeObj.positionX = posX;
                        propsObj.positionY = posY;
                        nodeObj.positionY = posY;
                        WidgetActions['updateProperties']({
                            originX:x,
                            originY:y,
                            positionX:posX,
                            positionY:posY
                        }, true, false, undefined, node);
                        bTag = false;
                    }
                    break;
                case propertyType.Select:
                    if(['type'].indexOf(prop.name)>=0 && node.className=='track'){
                        node.props[prop.name+'Key'] = value;
                        v = parseInt(value);
                    }
                    else if (['alignSelf','flex','flexDirection','justifyContent','alignItems','type'].indexOf(prop.name)>=0) {
                        node.props[prop.name+'Key'] = value;
                        v = value;
                    }
                    else if (prop.name == 'swipeType') {
                        node.props[prop.name+'Key'] = value;
                        v = parseInt(value);
                    }
                    else if(prop.name == 'scaleStage'){
                         node.props[prop.name+'Key'] = value;
                         v = value=='true'?true:false;
                    }
                    else if (prop.name == 'headerFontFamily') {
                        node.props.headerFontFamily = this.getFontDefault(value);
                        v = value;
                    }
                    else if(prop.name=='swipeType') {
                        node.props[prop.name+'Key'] = value;
                       v =parseInt(value);
                    }
                    else if (prop.name == 'type') {
                        let className = node.className;
                        if (className == 'track') {
                            node.props[prop.name+'Key'] = value;
                        } else {
                            node.props.type = this.getScaleTypeDefault(value, prop.options);
                            //属于第一组则设置初始隐藏,否则设置隐藏
                            node.props.initHide = false;
                            for (let i in prop.optionsToJudge) {
                                if (prop.optionsToJudge[i] == value) {
                                    node.props.initHide = true;
                                    break;
                                }
                            }
                        }
                        v = value;
                    }
                    else if (prop.name == 'forwardTransition' || prop.name == 'backwardTransition') {
                        node.props[prop.name + '_val'] = this.getScaleTypeDefault(value, prop.options);
                        v = parseInt(value);
                    }
                    else if (prop.name == 'fontFamily'&& node.className=='bitmaptext') {
                        if (value == 0) {
                            chooseFile('font', true, function () {
                                let fontObj = eval("(" + arguments[1] + ")");
                                let oProgress = document.getElementById('ant-progress');
                                //回调完成
                                oProgress.style.display = 'none';
                                //设置默认值
                                node.props[prop.name+'Key'] = fontObj.name;
                                //更新属性面板
                                const obj = {};
                                obj[prop.name] = fontObj.file;
                                this.onStatusChange({updateProperties: obj, changeNode:node});
                                WidgetActions['updateProperties'](obj, false, true, undefined, node);

                            }.bind(this), function (evt) {
                                let oProgress = document.getElementById('ant-progress');
                                if (evt.lengthComputable && oProgress) {
                                    oProgress.style.display = 'block';
                                    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                                    oProgress.childNodes[1].innerHTML = '上传 ' + percentComplete + '%';
                                    oProgress.childNodes[0].style.width = percentComplete + '%';
                                } else {
                                    //console.log('failed');
                                }
                            });
                            bTag = false;
                        }
                        else {
                            node.props[prop.name+'Key'] = this.getFontDefault(value);
                            v = value;
                        }
                    }
                    else if (prop.name == 'fontFamily') {
                        node.props[prop.name+'Key']=value;
                        v = value;
                    }
                    else if(prop.name == '_effectType'){
                        //let obj = {};
                        let name;
                        if(value == 0){
                            name = "track";
                        }
                        else {
                            this.state.effectList.map((v,i)=>{
                                if(i == value-1){
                                    name = v.name;
                                }
                            })
                        }
                        EffectAction['loadEffect'](true,name);
                        bTag = false;
                    }
                    else {
                        v = parseInt(value);
                    }
                    break;
                case propertyType.Boolean:
                    node.props[prop.name+'Key'] = value;
                    if(prop.name == 'flexWrap'){
                        value = value ?'wrap':'nowrap'
                    }
                    v = value;
                    break;
                case propertyType.Boolean2:
                    if (value === null) {
                        delete  node.props.initVisible;
                    }
                    else {
                        node.props.initVisible = value;
                    }
                    bTag = false;
                    break;
                case propertyType.TbSelect:
                    let header = node.props.header;
                    let tbWidth;
                    value = parseInt(value);
                    if(header !== undefined) {
                        header = header.split(",");
                        if (value == 0) {
                            let lineWidth = header[0];
                            let index = lineWidth.indexOf(':');
                            if( index>=0){
                                tbWidth = parseInt(lineWidth.substring(index + 1));
                            }
                            else {
                                tbWidth = "自动";
                            }
                        }
                        else {
                            let lineWidth = header[value-1];
                            let index = lineWidth.indexOf(':');
                            if( index>=0){
                                tbWidth = parseInt(lineWidth.substring(index + 1));
                            }
                            else {
                                tbWidth = "自动";
                            }
                        }
                    }

                    this.setState({
                        tbWhichColumn: value,
                        tbLineWidth : tbWidth
                    },()=>{
                        this.setState({fields: this.getFields()});
                    });

                    bTag = false;
                    break;
                case propertyType.Color2:
                    node.props[prop.name+'Key'] = value;
                    v = value;
                    break;
                case propertyType.Color:
                case propertyType.TbColor:
                    if(typeof value == 'boolean'){
                        let colorStr;
                        if(value){
                            colorStr =node.props[prop.name+'_originColor'];
                            node.props[prop.name+'_originColor']=null;
                        } else {
                            colorStr='transparent';
                            node.props[prop.name+'_originColor'] = node.props[prop.name];
                        }
                        v=colorStr;
                        node.props[prop.name+'Key'] = colorStr;
                    }else{
                        if(node.props[prop.name+'_originColor']){
                            node.props[prop.name+'_originColor']=value.target.value;
                        } else {
                            v=value.target.value;
                        }
                        node.props[prop.name+'Key'] = value.target.value;
                    }
                    //console.log(2,v);
                    break;
                case  propertyType.Button2:
                    if(prop.name == 'bgLink'){
                        if (value.target.getAttribute('class') ==='btn_del') {
                            //删除
                            value=null;
                            node.props[prop.name+'Key']='上传图片';
                            let obj={
                                bgLink:null
                            };
                            this.onStatusChange({updateProperties: obj, changeNode:node});
                            WidgetActions['updateProperties'](obj, false, true, undefined, node);
                            this.forceUpdate();
                            bTag = false;
                        }
                        else {
                            //上传
                            let thisObj=this;
                            if(node.rootWidget.imageList===undefined){
                                node.rootWidget.imageList=[];
                            }
                            chooseFile('image', false, (w) => {
                                if (w.files.length) {
                                    let fileName = w.files[0].name;
                                    let dot = fileName.lastIndexOf('.');
                                    if (dot > 0) {
                                        var ext = fileName.substr(dot + 1).toLowerCase();
                                        if (ext == 'png' || ext == 'jpeg' || ext == 'jpg') {
                                            fileName = fileName.substr(0, dot);
                                        }
                                    }
                                    var reader = new FileReader();
                                    let obj = {'bgLink': node.rootWidget.imageList.length};
                                    reader.onload = function (e) {
                                        node.props[prop.name + 'Key'] = fileName;
                                        node.rootWidget.imageList.push(e.target.result);
                                        thisObj.onStatusChange({updateProperties: obj, changeNode:node});
                                        WidgetActions['updateProperties'](obj, false, true, undefined, node);

                                    };
                                    reader.readAsDataURL(w.files[0]);
                                }
                            });
                            bTag = false;
                        }
                    }
                    v = value;
                    break;
                default:
                    v = value;
                    break;
            }
        }


        if(bTag){
            let obj = {};
            if(node.className == "table" && prop.name == "header"){
                if(v <= 0 || v == null) return;
                let header = node.props.header;
                if(header !== undefined){
                    header = header.split(",");
                    let b = v - header.length;
                    if(b > 0){
                        for(let a=1; a <= b ; a++){
                            header.push("");
                        }
                    }
                    else if(b < 0){
                        for(let a = -b; a > 0 ; a--){
                            header.splice(header.length-1, 1);
                        }
                    }
                }
                else {
                    header = [""];
                    for(let a=1; a < v ; a++){
                        header.push("");
                    }
                }
                obj[prop.name] = header.join(",");
                node.props.header = header.join(",");
                node.node.header = header.join(",");
                this.onStatusChange({updateProperties: obj, changeNode:node});
                WidgetActions['updateProperties'](obj, false, true, undefined, node);
                this.refs.TbCome.updateColumn(v,header);
            }
            else if(node.className == "table" && prop.name == "head"){
                obj['headerColor'] = v;
                node.props.headerColor = v;
                node.node.headerColor = v;
                this.onStatusChange({updateProperties: obj, changeNode:node});
                WidgetActions['updateProperties'](obj, false, true, undefined, node);
            }
            else if(node.className == "table" && prop.name == "showHeader"){
                obj[prop.name] = v;
                node.props.showHeader = v;
                node.node.showHeader = v;
                this.onStatusChange({updateProperties: obj, changeNode:node});
                WidgetActions['updateProperties'](obj, false, true, undefined, node);
                this.setState({
                    tbHeaderToggle : !v
                },()=>{
                    this.setState({fields: this.getFields()});
                });
            }
            else {
                let obj={};
                obj[prop.name] = v;
                this.onStatusChange({updateProperties: obj, changeNode:node});
                WidgetActions['updateProperties'](obj, false, true, undefined, node);
            }
        }

    }
    sliderUp(node,event){
        const obj = {};
        let v = parseFloat(event) / 100 ;
        obj['alpha'] = v;
        node.props.alpha = v;
        node.node.alpha = v;
        this.onStatusChange({updateProperties: obj, changeNode: node});
        WidgetActions['updateProperties'](obj, false, true, undefined, node);
    }
    sliderChange(node, event){
        const obj = {};
        let v = parseFloat(event) / 100 ;
        obj['alpha'] = v;
        node.props.alpha = v;
        node.node.alpha = v;
        this.onStatusChange({updateProperties: obj, changeNode: node});
        WidgetActions['updateProperties'](obj, false, true, true, node);
    }
    tbHeadHeightInput(event){
        this.setState({
            tbHeadHeight : event.target.value
        })
    }
    tbHeadHeight(node){
        let v = parseInt(this.state.tbHeadHeight);
        const obj = {};
        obj['headerHeight'] = v;
        node.props.headerHeight = v;
        node.node.headerHeight = v;
        this.onStatusChange({updateProperties: obj, changeNode: node});
        WidgetActions['updateProperties'](obj, false, true, undefined, node);
    }

    tbLineWidthInput(event){
        this.setState({
            tbLineWidth : event.target.value
        },()=>{
            this.setState({fields: this.getFields()});
        })
    }

    tbLineWidth(node){
        if(this.state.tbLineWidth == "自动") return;
        if(this.state.tbLineWidth >= node.props.width) return;

        let v = parseInt(this.state.tbLineWidth) ;

        const obj = {};
        let header = node.props.header;
        if(header !== undefined){
            header = header.split(",");
            if(this.state.tbWhichColumn == 0){
                header.map((k,i)=>{
                    let index = header[i].indexOf(':');
                    if(index >=0){
                        header[i] = k.substring(0,index+1) +v;
                    }
                    else {
                        header[i]= k + ":" + v
                    }
                });
            }
            else {
                let index = header[this.state.tbWhichColumn-1].indexOf(':');
                if(index >=0){
                    header[this.state.tbWhichColumn-1] = header[this.state.tbWhichColumn-1].substring(0,index+1) +v;
                }
                else {
                    header[this.state.tbWhichColumn-1] = header[this.state.tbWhichColumn-1]+":" + v
                }
            }
            //console.log(header.join(","));
            obj['header'] = header.join(",");
            node.props.header = header.join(",");
            node.node.header = header.join(",");
            this.onStatusChange({
                updateProperties: obj,
                changeNode: node
            });
            WidgetActions['updateProperties'](obj, false, true, undefined, node);
            //this.setState({fields: this.getFields()});
        }
    }

    onChangePropDom(item, node, value) {
        if(item.type === propertyType.String || item.type === propertyType.Text ||item.type === propertyType.Color2){
            this.onChangeProp(item, node, (value && value.target.value !== '') ? value.target.value : undefined);
        }
        else{
            this.onChangeProp(item, node, value);
        }
    }

    getScaleTypeDefault(value ,options){
        for(let i in options){
            if(value == options[i]){
                return i;
            }
        }
    }

    getFontDefault(value){
        for(let i in this.fontList){
            if(value == this.fontList[i].file){
                return  this.fontList[i].name;
            }
        }
    }

    //获取中心点下拉框默认值
    getSelectDefault(originPos,options){
        for(let i in options){
            if(options[i][0]==originPos.x && options[i][1]==originPos.y  ){
                return i;
            }
        }
        return originPos.x+','+originPos.y;
    }
    getOldOrigin(key,options){
        if(key == undefined){
            key='中心';
        }
        for(let i in options){
            if(i==key){
                return options[i];
            }
        }
        return key.split(',');
    }


    getFields() {
    //    console.log( this.selectNode);
        let node = this.selectNode;
        if (!node)  return null;

        let className=this.generateClassName(node);//生成className
        if(!className)  return null;

        // if(!node.props.block) {
            this.lockRatio(node);//初始化时,锁定部分属性面板的宽高比
        // }
        let groups = {};
        this.generateGroups(node,className,groups);//生成groups,其中涉及到html的拼接
        groups = this.sortGroups(groups);//排序groups

        let styleObj={
            "active" : !this.state.tbHeaderToggle
        }

        //定制专门的样式,加在Form上面.如flex下的container
        let resultObj=this.getStyleObj(node);
        if(resultObj){
            styleObj[resultObj.name]=resultObj.value;
        }


        return Object.keys(groups).map((name,index) =>{
            let insertClassName =  className + "-" + 'form_'+name;//插入一个按钮
            return <Form horizontal
                         className={cls('form_'+name,styleObj,{ "hidden" : node.timerWidget !==null && name == "buttonArea" })}
                         key={index}>
                {groups[name].map((input, i) => input)}
                {
                    insertClassName == "table-form_basic"
                        ?<button className="btn-clear table-form_basic_btn" onClick={this.tbComeShow}>表格数据来源</button>
                        : null
                }
            </Form>
        });
    }
    /****************工具方法区域,start**************
     * 注:
     * 1 如果有修改,请在注释上写上修改人 修改时间 修改内容
     * 2 属性面板涉及到的属性过多,很容易写的混乱,应将工具类的方法提取出来,只留下主线
     * **********************************/
    /***
     * luozheao,20161118
     * 功能:
     * 有些属性面板需要专门定制整体的样式,如flex下的container
     * 返回class名字,和控制显示的布尔值
     */
    getStyleObj(node){
        if(node.className=='container' && node.node.padding !==undefined){
            return {name:'flexContainer',value:true}
        }
        else  if(node.className=='flex'){
            return {name:'flexContainer',value:true}
        }
        else  if(node.className=='root'){
            return {name:'stageLoopSet',value:true}
        }
        return null
    }

    /**
     * luozheao,20161116
     * 功能:
     * 锁定宽高比事件
     * isCanKeepRatio与历史记录相关
     * */
    antLock(){
        //二维码固定锁住宽高比
        if(this.selectNode.node.class != 'qrcode'){
            this.selectNode.node.keepRatio=!this.selectNode.node.keepRatio;
            let obj={};
            obj.keepRatio =  this.selectNode.node.keepRatio;
            WidgetActions['updateProperties'](obj, false, false);
            this.isCanKeepRatio = true;
        }
     }

    /**
     * luozheao,20161116
     * 功能:
     * 生成classname
     * @param node
     * @returns {className}
     */
    generateClassName(node){
        let className = node.className.charAt(0) == '_'?'class':node.className;
        if(className == 'data') {
            switch (node.props.type) {
                case dataType.oneDArr:
                    className = dataType.oneDArr;
                    break;
                case dataType.twoDArr:
                    className = dataType.twoDArr;
                    break;
            }
        }
        if (getPropertyMap(node, className, 'props').length===0){
            return null;
        }
        return className;
    }

    /**
    * luozheao,20161116
    * 功能:
    * 初始时,锁定属性面板的宽高比
    * 其中isCanKeepRatio跟历史记录功能有关
    * */
    lockRatio(node){
        let isKeepRatioArr=['qrcode','rect','image','bitmaptext','imagelist','ellipse','path','container'];
        if( node.node.keepRatio ===undefined && isKeepRatioArr.indexOf(node.node.class)>=0){
            this.isCanKeepRatio = true;
        }
        if( node.node.keepRatio ===undefined  && this.isCanKeepRatio){
            node.node.keepRatio = true;
            let obj={};
            obj.keepRatio =  node.node.keepRatio;
            WidgetActions['updateProperties'](obj, false, true);
            this.isCanKeepRatio = false;
        }
    }

    /**
    *luozheao,20161115
    * 功能:
    * 给属性面板各模块和模块内部组件排序
    * */
    sortGroups(groups) {

        let sortArr = sortGroupArr;
        let obj={};
        //模块排序
        sortArr.map((v,i)=>{
              if(groups[v]){
                  obj[v]=groups[v]
              }
        });
        //模块内部排序
        for(let i in obj){
            let objArr=[];
            let orderNoArr=[];
            obj[i].map((v,i)=>{
                if(v.props.order){
                    //冒泡排序
                    if(objArr.length==0){
                        objArr.push(v);
                    }else{
                         let tag=true;
                         objArr.forEach((k,index)=>{
                             if(tag && v.props.order<=k.props.order){
                                 objArr.splice(index,0,v);
                                 tag=false;
                             }
                         });
                         if(tag){
                             objArr.push(v);
                         }
                    }
                }else{
                    orderNoArr.push(v);
                }
            });
            obj[i]=objArr.concat(orderNoArr);
        }
       return obj;
    }

    /**
     * luozheao,20161116
     * 功能:
     * 在getInput中调用
     * 设定模块内部组件需要显示的值
     * */
    setComponentDefaultValue(item,className,node){
        //值的修改分为两种,一种是修改后就显示成什么,一种是修改后要转换一下才能显示,如中心点:选择左上,实际上输入0,0,显示的时候就不能用
        // node.prop.originPos/node.node.originPos显示了,而是用node.node[node.node.props.name+'Key']来显示
        //node.node[node.node.props.name+'Key']专门用来存储转换后的值,在onChangeProp中设置
        let defaultValue;

        if (item.readOnly) {
            defaultValue=node.node[item.name];
            if (item.name == 'sockName') {
                defaultValue = this.state.sockName
            }
        }
        else if(item.type == propertyType.Button2){
              defaultValue=item.ButtonName;
              if (item.name == 'bgLink' && node.props[item.name + 'Key']) {
                defaultValue = node.props[item.name + 'Key'];
              }
        }
        else if (item.type == propertyType.Float) {
            if (node.className == 'html') {
                let str = item.name == 'scaleX' ? 'shapeWidth' : 'shapeHeight';
                let str2 = item.name == 'scaleX' ? 'width' : 'height';
                if (!node.node.defaultData) {
                     node.node.defaultData = {};
                }
                node.node.defaultData[str2] = node.props[str];
                defaultValue = node.props[str2];
                if (!defaultValue) {
                    defaultValue = node.props[str];
                    node.props[str2] = defaultValue;
                }
            }
            else {
                let str = item.name == 'scaleX' ? 'width' : 'height';
                defaultValue = (node.node.class == 'bitmaptext' && this.textSizeObj) ? this.textSizeObj[str] : node.node[str];
                this.textSizeObj = null;
                if (!node.node.defaultData) {
                    node.node.defaultData = {};
                }
                //只执行一次
                //设置初始宽高,便于计算放大缩小的系数
                if (node.node.defaultData[str]===undefined) {
                    node.node.defaultData[str] = defaultValue/ node.node[item.name];
                }
            }
        }
        else if (item.type == propertyType.Color || item.type == propertyType.Color2 || item.type === propertyType.TbColor) {
            defaultValue = node.props[item.name];
            if( node.props[item.name+'Key'] !==undefined){
                defaultValue = node.props[item.name+'Key'];
            }
            if (node.props[item.name + '_originColor']) {  //舞台颜色隐藏后保存的颜色
                defaultValue = node.props[item.name + '_originColor'];
            }
            if (item.type === propertyType.TbColor) {
                defaultValue = node.props['headerColor'];
            }
        }
        else if (item.type == propertyType.Dropdown) {
            //设置中心点
            defaultValue = item.default;
            //当originY时才会激活,而不是originPos
            if (node.props.originPosKey && (item.name == 'originX' || item.name == 'originY' || item.name == 'originPos')) {
                defaultValue = node.props.originPosKey;
            }
        }
        else if (item.type == propertyType.Select || item.type == propertyType.TbSelect) {
            defaultValue = item.default;
            //当originY时才会激活,而不是originPos
            if (['font', 'scaleStage',  'swipeType', 'alignSelf', 'flex', 'flexDirection', 'justifyContent', 'alignItems','type'].indexOf(item.name) >= 0 && node.props[item.name + 'Key']) {
                defaultValue = node.props[item.name + 'Key'];
            }
            else if (item.name == 'fontFamily' && node.props[item.name + 'Key'] && node.className=='bitmaptext') {
                defaultValue = node.props[item.name + 'Key'];
            }
            else if (item.name == 'fontFamily' && node.props[item.name + 'Key']) {
                defaultValue = node.props[item.name + 'Key'];
            } else if ((item.name == 'forwardTransition' || item.name == 'backwardTransition') && node.props[item.name + '_val']) {
                defaultValue = node.props[item.name + '_val'];
            }  else if (item.name == 'headerFontFamily' && node.props.headerFontFamily) {
                defaultValue = node.props.headerFontFamily;
            } else if (item.name == 'swipeType' && node.props[item.name+'Key']) {
                defaultValue = node.props[item.name+'Key'];
            } else if (item.name == 'chooseColumn') {
                defaultValue = this.state.tbWhichColumn == 0 ? '全部' : '第 ' + this.state.tbWhichColumn + ' 列';
            }
        }
        else if (item.type === propertyType.Boolean2) {
            if (node.props[item.name] === undefined) {
                defaultValue = item.default;
            } else {
                if (node.props[item.name] == false) {
                    defaultValue = 2;
                } else if (node.props[item.name] == true) {
                    defaultValue = 0;
                } else {
                    defaultValue = 1;
                }
            }
        }
        else if (item.type === propertyType.Percentage) {
            defaultValue = item.default * 100;
            if (node.props[item.name] !== undefined) {
                defaultValue = node.props[item.name] * 100;
            }
        }
        else if(item.type === propertyType.Number) {
            defaultValue = node.props[item.name];
            if (['totalTime','marginUp','marginDown','marginLeft','marginRight','paddingUp','paddingDown','paddingLeft','paddingRight'].indexOf(item.name)>=0 && node.props[item.name+'Key']) {
                defaultValue = node.props[item.name + 'Key'];
            }
            if(typeof defaultValue == 'string'){
                defaultValue=defaultValue.split('%')[0];
                defaultValue=defaultValue.split('px')[0];
            }
        }
        else if(item.type === propertyType.Integer) {
            //初始化的时候,可能props在DEFAUL_TOOLBOX并没有设置初始值
            //这时候需要调用node里面的东西,即后台默认设置的值
             defaultValue = node.props[item.name];
             if(defaultValue===undefined) {
                 defaultValue = node.node[item.name];
             }

            if (typeof defaultValue == 'string') {
                defaultValue=defaultValue.split('%')[0];
                defaultValue=defaultValue.split('px')[0];
            }
        }
        else if(item.type === propertyType.Boolean) {
            defaultValue = node.props[item.name];

            if(node.props[item.name+'Key'] !==undefined){
                defaultValue =node.props[item.name+'Key'];
            }
            // if(item.name=='flexWrap' && node.props[item.name+'Key'] !==undefined){
            //     defaultValue =node.props[item.name+'Key'];
            // }
        }
        else if(item.type == propertyType.Button){
            if(className == "track"){
                //console.log(this.selectNode,item);
                if(node.timerWidget == null){
                    // "track" 是轨迹 ， "effect" 是动效 , "editEffect" 是 编辑动效
                    if(node.props.trackType == "track"){
                        if(item.name != "_createEffect"){
                            item.styleName = item.olderClassName + " hidden";
                        }
                        else {
                            item.styleName = item.olderClassName;
                        }
                    }
                    else if(node.props.trackType == "effect"){
                        EffectAction['changeTrackType'](false);
                        if(item.name != "_editTrack" && item.name != "_playTrack"){
                            item.styleName = item.olderClassName + " hidden";
                        }
                        else {
                            item.styleName = item.olderClassName;
                        }
                    }
                    else{
                        if(item.name == "_editTrack" || item.name == "_createEffect" || item.name == "_playTrack"){
                            item.styleName = item.olderClassName + " hidden";
                        }
                        else if(item.name == "_saveTrack" && node.props.is_system == 1 ){
                            item.styleName = item.olderClassName + " hidden";
                        }
                        else if(item.name == "_saveAsTrack" && node.props.is_system == 1 ){
                            item.styleName = item.olderClassName + " is_system";
                        }
                        else {
                            item.styleName = item.olderClassName;
                        }
                    }
                }
                else {
                   item.styleName = item.olderClassName + " hidden";
                }
            }
        }
        else if (node.props[item.name] === undefined) {
              if (className == "table" && item.name == "headerFontSize") {
                defaultValue = 26;
                node.props.headerFontSize = 26;
                node.node.headerFontSize = 26;
                let obj = {};
                obj['headerFontSize'] = 26;
                WidgetActions['updateProperties'](obj, false, true, undefined, node);
            } else if (className == "table" && item.name == "fontSize") {
                defaultValue = 26;
                node.props.fontSize = 26;
                node.node.fontSize = 26;
                let obj = {};
                obj['fontSize'] = 26;
                WidgetActions['updateProperties'](obj, false, true, undefined, node);
            } else {
                // defaultValue='';
                defaultValue = node.node[item.name];
            }
        }
        else {
            if (className == "table") {
                if (item.name == "rowNum") {
                    defaultValue = node.props[item.name] ? node.props[item.name] : 0;
                }
                else if (item.name == "header") {
                    if (node.props[item.name] == undefined) {
                        node.props[item.name] = " ";
                        defaultValue = 0;
                    }
                    else {
                        let header = node.props[item.name].split(",");
                        defaultValue = header.length;
                    }
                }
                else {
                    defaultValue = node.props[item.name];
                }
            }
            else {
                defaultValue = node.props[item.name];
            }
            if (item.name == 'alpha') {
                defaultValue = defaultValue * 100;
            }
        }
        return defaultValue;
    }

    /**
     * luozheao,20161116
     * 功能:
     * 在getInput中调用
     * 设定模块内部组件特殊的属性
     * */
    setComponentDefaultProp(item,className,node,defaultProp,defaultValue){
        if (item.type === propertyType.Boolean || item.type === propertyType.Boolean2) {
            defaultProp.checked = defaultValue;
            if (className == 'table' && item.name == "showHeader") {
                if (!this.state.tbHeaderToggle !== defaultProp.checked) {
                    this.setState({
                        tbHeaderToggle: !defaultProp.checked
                    })
                }
            }
        } else if (item.type === propertyType.Number) {
           // defaultProp.name =item.name;
            defaultProp.value = defaultValue;
        }
        else if (item.type === propertyType.Float) {
          //  defaultProp.name =item.name;
            defaultProp.value = defaultValue;
        }
        else if (item.type == propertyType.Dropdown) {
            defaultProp.value = defaultValue;
            defaultProp.item = item;
            let arr = [];
            for (var i in  item.options) {
                arr.push(<MenuItem key={item.options[i]}>
                    <div className='originIcon'></div>
                    {i}</MenuItem>);
            }
            defaultProp.overlay = <Menu className='dropDownMenu2' onClick={defaultProp.onChange}>{arr}</Menu>;

        }
        else if (item.type == propertyType.Select || item.type == propertyType.TbSelect) {
            let selectClassName = '';
            defaultProp.options = [];
            defaultProp.value = defaultValue;
            if (item.name == 'originY' || item.name == 'originPos') {
                selectClassName = 'originIcon';
            }
            else if (item.name == 'fontFamily' && node.className=='bitmaptext') {
                defaultProp.name = item.name;
                defaultProp.options.push(<Option key={0}>
                    <div className={selectClassName}></div>
                    上传字体</Option>);
                for (let i in this.fontList) {
                    defaultProp.options.push(<Option key={this.fontList[i].file}>
                        <div className={selectClassName}></div>
                        {this.fontList[i].name}</Option>);
                }
            }
            else if (item.name == 'fontFamily' || item.name == 'headerFontFamily') {
                for (let i in this.fontFamilyList) {
                    defaultProp.options.push(<Option key={this.fontFamilyList[i].file}>
                        <div className={selectClassName}></div>
                        {this.fontFamilyList[i].name}</Option>);
                }
            }
            else if (item.name == 'type') {
                for (let i in  item.options) {
                    selectClassName = (item.options[i] == 'slideInUp' || item.options[i] == 'jello') ? 'optionline' : '';
                    defaultProp.options.push(<Option key={item.options[i]} className={selectClassName}>{i}</Option>);
                }
            }
            else if(item.name == '_effectType'){
                defaultProp.options.push(<Option key={0} >自定义</Option>);
                if(this.state.effectList.length > 0){
                   this.state.effectList.map((v,i)=>{
                       defaultProp.options.push(<Option key={ i+1 }>{v.name}</Option>);
                   })
                }
                if(node.props.effectCome == undefined || node.props.effectCome == "track"){
                    defaultProp.value = "自定义";
                }
                else {
                    defaultProp.value = node.props.effectCome + " ";
                }
                //console.log(defaultProp.value);
            }

            if (defaultProp.options.length == 0) {
                //优化:设置了value的值
                for (var i in  item.options) {
                    defaultProp.options.push(
                        <Option
                            key={item.options[i]}>
                        <div className={selectClassName}></div>
                        {i}</Option>
                    );
                }
            }
            if (item.name == 'chooseColumn') {
                defaultProp.options = [];
                let tbWidth;
                if (node.props['header'] == undefined) {
                    tbWidth = "自动";
                    defaultProp.options.push(<Option key={0}>全部</Option>);
                }
                else {
                    let header = node.props['header'].split(",");
                    let nodo = true;
                    if (this.state.tbWhichColumn == 0) {
                        nodo = false
                    }
                    if (nodo) {
                        let lineWidth = header[this.state.tbWhichColumn - 1];
                        let index = lineWidth.indexOf(':');
                        if (index >= 0) {
                            tbWidth = parseInt(lineWidth.substring(index + 1));
                        }
                        else {
                            tbWidth = "自动";
                        }
                    }
                    else {
                        let lineWidth = header[0];
                        let index = lineWidth.indexOf(':');
                        if (index >= 0) {
                            tbWidth = parseInt(lineWidth.substring(index + 1));
                        }
                        else {
                            tbWidth = "自动";
                        }
                    }

                    for (let x = 0; x <= header.length; x++) {
                        let data;
                        if (x == 0) {
                            data = "全部";
                        }
                        else {
                            data = '第 ' + (x) + ' 列';
                        }
                        defaultProp.options.push(<Option key={x}>{ data } </Option>);
                    }
                }
                defaultProp.tbWidth = tbWidth;
            }
        } else if (item.type == propertyType.Color || item.type == propertyType.Color2) {
            defaultProp.defaultChecked = node.props[item.name + '_originColor'] ? false : true;
            defaultProp.value = defaultValue;
        } else if (item.type === propertyType.TbColor) {
            defaultProp.value = defaultValue;
            defaultProp.tbHeight = node.props['headerHeight'] ? node.props['headerHeight'] : "自动";
        } else {
            defaultProp.value = defaultValue;
        }
    }

    /**
     * luozheao,20161116
     * 功能:
     * generateGroups中调用
     * 拼接出属性模块,并注入到groups里面
     * */
    getInput(item,className, groups, cNode){
        let node=this.selectNode;

        if(className=='track'&& (item.name=='autoPlay'||item.name=='loop') && fnIsUnderTimer(node)){
            return '';
        }

        //小模块处理
        if(cNode&&node.props.block) {
            //对不同mapping属性属性的处理
            node = cNode;
        }

        //设置通用默认参数和事件
        let defaultProp = {
            size: 'small',
            placeholder: item.default,
            name:item.name,
            disabled: item.readOnly === true,
            onChange: this.onChangePropDom.bind(this, item, node)
        };
        let defaultValue =this.setComponentDefaultValue(item,className,node);

        this.setComponentDefaultProp(item,className,node,defaultProp,defaultValue);//设置defaultProp

        let groupName = item.group || 'basic';
        if (groups[groupName] === undefined) groups[groupName] = [];

        /******** 设置布局结构和图标*************/
            //todo:dear friend, 有些杂乱,有空优化下吧
        let hasTwin; //左右结构显示
        let hasOne=false;  //独占一栏结构显示,用于兼容旋转度属性独占一栏的样式
        let isBody= className == "body"?true:false;  //对body对象定制样式

        let isAutoGravity = item.name == 'autoGravity'?true:false;
        let tdColorSwitch =className == "table" && ['fontFill','fillColor','altColor'].indexOf(item.name)>=0?true: false;

        let hasPx = ['X', 'Y', 'W', 'H','原始宽', '原始高', '网格大小' ,'边距上','边距下','边距左','边距右','最大宽','最小宽','最大高','最小高'].indexOf(item.showName) >= 0; //判断input中是否添加px单位

        let hasRate=false;//是否加%
        if(item.showName=='不透明度'){
            hasRate=true;
        }else if(node.props[item.name+'isRate']===true) {
            hasRate = true;
            hasPx=false;
        }

        let hasDegree = ['旋转度'].indexOf(item.showName) >= 0; //判断input中是否添加°单位
        let hasLock = item.showLock == true; //判断是否在元素前添加锁图标

        if (className == "table") {
            hasTwin = ['X', 'Y', 'W', 'H', '旋转度', '中心点', 'shapeW', 'shapeH', 'scaleX', 'scaleY', '原始宽', '原始高', '行数', '列数', '头部字体', '图表字体大小', '字体', '网格颜色', '网格大小'].indexOf(item.showName) >= 0;
        }
        else if (className === 'twoDArr') {
            hasTwin = ['行', '列'].indexOf(item.showName) >= 0;
        }
        else if (['timer','track','slidetimer','pagecontainer'].indexOf(className)>=0) {
            hasTwin = ['X', 'Y', 'W', 'H', 'shapeW', 'shapeH', 'scaleX', 'scaleY', '原始宽', '原始高', '自动播放', '循环播放'].indexOf(item.showName) >= 0;
            hasOne = item.name == 'rotation'?true:false;
        }
        else if (['container', 'canvas', 'flex', 'world'].indexOf(className) >= 0) {
            hasTwin = ['X', 'Y', 'W', 'H', 'shapeW', 'shapeH', 'scaleX', 'scaleY',
                    '原始宽', '原始高', '北墙', '南墙', '西墙', '东墙'
                    ,'边距上','边距下','边距左','边距右','最大宽','最小宽','最大高','最小高'
                ].indexOf(item.showName) >= 0;
            hasOne = item.name == 'rotation'?true:false;
        }
        else {
            hasTwin = ['X', 'Y', 'W', 'H', '旋转度', '中心点', 'shapeW', 'shapeH', 'scaleX', 'scaleY',
                    '原始宽', '原始高', '固定x坐标', '固定y坐标', '碰撞反应', '圆形边界'
                    ,'边距上','边距下','边距左','边距右','最大宽','最小宽','最大高','最小高'
                ].indexOf(item.showName) >= 0;
        }

       //拼接图标样式
        let htmlStr;
        if (item.imgClassName) {
            htmlStr = <label>
                <div className={item.imgClassName}></div>
            </label>
        } else {
            htmlStr = hasLock
                ? <label>
                <div className={cls('ant-lock', {'ant-lock-checked': node.node.keepRatio})}
                     onClick={this.antLock.bind(this)}></div>
                {item.showName}
            </label>
                : <label>{item.showName}</label>
        }




        let style = {};
        if (item.tbCome) {
            defaultProp.tbCome = item.tbCome;
            if (item.tbCome == "tbF") {
                style['width'] = "184px";
                style['height'] = "22px";
                style['lineHeight'] = "22px";
            }
            else {
                style['width'] = "58px";
                style['marginLeft'] = "3px";
                style['height'] = "22px";
                style['lineHeight'] = "22px";
            }
        }
        else if(className == "track" && node.timerWidget == null
                && ( item.name == '_createEffect' || item.name == "_editTrack" || item.name == "_playTrack"
                        || item.name == "_saveTrack" || item.name == "_saveAsTrack" || item.name == "_cancelTrack") )
        {
            style['margin'] = "0";
            if(item.name == "_saveTrack" || item.name == "_saveAsTrack"  || item.name == "_editTrack" || item.name == "_playTrack"){
                style['width'] = "50%";
                style['float'] = "left";
            }
            else {
                style['width'] = "100%";
            }
        }
        else if(className == "track" && node.timerWidget != undefined && item.name == "_effectType"){
            style['margin'] = "0";
            style['display'] = "none";
        }

        groups[groupName].push(
            <div key={item.name+item.showName}
                 order={item.order}
                 className={cls('f--hlc', 'ant-row', 'ant-form-item',
                     {
                         'ant-form-half': hasTwin,
                         'ant-form-full': !hasTwin,
                         'ant-body': isBody,
                         'ant-rotation': hasOne,
                         'ant-autoGravity': isAutoGravity,
                         'tdColorSwitch': tdColorSwitch
                     }
                 )}
                 style={style}>
                <div
                    className={cls('ant-col-l ant-form-item-label', {"hidden": defaultProp.tbCome == "tbS" || item.type== propertyType.Button  })}>{htmlStr}</div>
                <div
                    className={cls('ant-col-r', {"tbSSStyle": defaultProp.tbCome == "tbS"}, {"tbFSStyle": defaultProp.tbCome == "tbF"})}>
                    <div className={cls('ant-form-item-control',
                        {'ant-input-degree': hasDegree},
                        {'ant-input-px': hasPx},
                        {'ant-input-rate': hasRate}
                    )}>
                        {this.getInputBox(item.type, defaultProp, item, cNode)}
                    </div>
                </div>
            </div>
        );
    }

    /**
    *luzoheao,20161116
    * 功能:
    * 生成groups,并过滤掉一些属性
     */
    generateGroups(node,className,groups){
        let getInput=this.getInput.bind(this);
        if(node.props.block) {
            //小模块的获取属性
            node.props.block.mapping.props.forEach((item) =>{
                let obj = WidgetStore.getWidgetByKey(item.mappingKey);
                let oObj = WidgetStore.getWidgetByKey(item.objKey);
                let copy = JSON.parse(JSON.stringify(item.detail));
                if (oObj && obj && copy && copy.name && copy.type !== propertyType.Hidden) {
                    delete copy.imgClassName;
                    copy.showName = item.name;
                    copy.default = obj.props[copy.name]?obj.props[copy.name]:copy.default;
                    copy.value = obj.props[copy.name];
                    getInput(copy,className, groups, obj);
                }
            });
        } else {
            getPropertyMap(node, className, 'props').forEach((item, index) => {
                if (item.type !== propertyType.Hidden) {
                    getInput(item,className, groups);
                }
            });
        }
    }
    /****************工具方法区域,end**********************************/

    onStatusChange(widget) {

        //console.log(widget);

        if(widget.fontListObj){
            this.fontList =  widget.fontListObj.fontList;
        }

        if(widget.selectWidget){
            if(widget.selectWidget.className == "sock"){
                this.setState({
                    sockName : widget.selectWidget.node.name
                })
            }
        }

        if(widget.selectWidget||(widget.updateProperties && widget.updateProperties.positionX !==undefined && widget.updateProperties.positionY !==undefined )){

            let jsColorArr=document.getElementsByClassName('jscolor-active');
            if(jsColorArr){
                for(let i=0;i<jsColorArr.length;i++){
                    jsColorArr[i].jscolor.hide();
                }
            }

        }

        if(widget.imageTextSizeObj){
            this.textSizeObj = widget.imageTextSizeObj;
            WidgetActions['render']();
            this.setState({fields: this.getFields()});
        }

        if (widget.selectWidget !== undefined){
            this.selectNode = widget.selectWidget;
            let propertyName = this.selectNode.props.name;
            if(this.selectNode.props.block) {
                propertyName = this.selectNode.props.block.name;
            }
            this.setState({fields: this.getFields(),propertyName:propertyName});
            let node = this.selectNode;

            while (node != null) {
                if (node.className == 'page') {
                    if (node != this.currentPage) {
                        this.currentPage = node;
                        node.parent.node['gotoPage'](node.node);
                    }
                    break;
                }
                node = node.parent;
            }

            if(widget.selectWidget.className == "table" && this.lastSelectKey !== widget.selectWidget.key){
                this.lastSelectKey = widget.selectWidget.key;
                this.setState({
                    tbHeaderToggle : true
                })
            }
            else if(widget.selectWidget.className != "table"){
                this.lastSelectKey = null;
            }

        } else if (widget.updateProperties !== undefined && widget.skipProperty === undefined) {

            let needRender = (widget.skipRender === undefined);

            let selectNode = this.selectNode;
            if(this.selectNode.props.block &&  widget.changeNode) {
                selectNode = widget.changeNode;
            }
            let obj = widget.updateProperties;
            let className = selectNode.className;
            if (className.charAt(0) == '_')  className = 'class';
            // console.log( getPropertyMap(selectNode, className, 'props'));
            getPropertyMap(selectNode, className, 'props').map(item => {
                // console.log(item,obj,selectNode,needRender);
                if (item.type !== propertyType.Hidden&&obj[item.name] !== undefined) {
                    if (obj[item.name] === null) {
                        delete(selectNode.props[item.name]);
                        if (needRender)
                            selectNode.node[item.name] = undefined;
                    } else {
                        selectNode.props[item.name] = obj[item.name];
                        if (needRender){
                            selectNode.node[item.name] = obj[item.name];
                        }
                    }
                }
            });
            if (needRender)
                WidgetActions['render']();
            this.setState({fields: this.getFields()});
        }
        if(widget.historyPropertiesUpdate){
            this.forceUpdate();
        }

        //数据库列表的获取
        if(widget.allWidgets){
            let dbList = [];
            widget.allWidgets.map((v,i)=>{
                if(v.className == "db"){
                    let data = {};
                    if(v.node.dbType == "shareDb"){
                        this.state.AllDbList.map((v1,i1)=>{
                            if(v1.id == v.props.dbid){
                                data = v1;
                                dbList.push(data);
                                this.setState({
                                    dbList : dbList
                                })
                            }
                        })
                    }
                    else {
                        WidgetActions['ajaxSend'](null, 'POST', 'app/dbGetParm/' + v.props.dbid, null, null, function(text) {
                            var result = JSON.parse(text);
                            //console.log(result);
                            if (result['header']) {
                                data['id'] = v.props.dbid;
                                data['name'] = v.props.name;
                                data['header'] = result['header'];
                            }
                            else {
                                data['id'] = v.props.dbid;
                                data['name'] = v.props.name;
                            }
                            dbList.push(data);
                            this.setState({
                                dbList : dbList
                            })
                        }.bind(this));
                    }
                }
            })
        }
    }

    DbHeaderData(data,bool){
        this.setState({
            AllDbList : data
        })
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            expanded: nextProps.expanded
        })
    }
    componentDidMount() {



        this.unsubscribe = WidgetStore.listen(this.onStatusChange.bind(this));
        this.effectChange = EffectStore.listen(this.effectChangeFuc.bind(this));
        DbHeaderStores.listen(this.DbHeaderData.bind(this));
        this.moudleMove = new PropertyViewMove('PropertyViewHeader', this);
        $('#PropertyView').on('focus','textarea,input',function () {
              $(this).select();
        });
    }
    componentWillUnmount() {
        this.unsubscribe();
        this.effectChange();
        DbHeaderStores.removeListener(this.DbHeaderData.bind(this));
        this.moudleMove.unBind();
        $('#PropertyView').unbind();
    }

    tbComeShow(){
        if( this.selectNode.className !== "table") return;
        let data = this.selectNode.props.dbid ? this.selectNode.props.dbid : null;
        let header = this.selectNode.props.header;
        let column = 0;
        if(header != undefined){
            column = header.split(',').length;
        }
        this.refs.TbCome.show(data,column,header);
    }

    effectChangeFuc(data){
        if(data.effectList){
            this.setState({
                effectList : data.effectList
            })
        }
        if(data.createEffect){
            this.selectNode.props.trackType = "effect";
            this.selectNode.node.trackType = "effect";
            this.selectNode.props.name = data.createEffect;
            this.selectNode.node.name = data.createEffect;
            let obj = {};
            obj['trackType'] = "effect";
            obj['name'] = data.createEffect;
            WidgetActions['updateProperties'](obj, false, true);
            EffectAction['toggleMode']("effect");
            this.setState({fields: this.getFields()});

            EffectAction['changeTrackType'](false);
        }
        if(data.updateEffect){
            this.selectNode.props.trackType = "effect";
            this.selectNode.node.trackType = "effect";
            let obj = {};
            obj['trackType'] = "effect";
            WidgetActions['updateProperties'](obj, false, true);
            EffectAction['toggleMode']("effect");
            this.setState({fields: this.getFields()});

            EffectAction['changeTrackType'](false);
        }
        if(data.effectToggleTrack){
            this.effectToggleTrack();
        }
    }

    effectToggleTrack(){
        this.selectNode.props.trackType = "editEffect";
        this.selectNode.node.trackType = "editEffect";
        let obj = {};
        obj['trackType'] = "track";
        WidgetActions['updateProperties'](obj, false, true);
        EffectAction['toggleMode']("track");
        this.setState({fields: this.getFields()});
    }

    render() {
        return (
            <div>
                <div id='PropertyView'
                     ref='PropertyView'
                     style={{ left : this.state.expanded? '65px':'37px'}}
                     className={cls({'hidden':this.props.isHidden})}>
                    <h1 id='PropertyViewHeader'>{this.state.propertyName}的属性</h1>
                    <div id='PropertyViewBody'>
                        {this.state.fields}
                    </div>
                </div>
                <TbCome ref="TbCome" />
            </div>
        );
    }
}
module.exports = PropertyView;
