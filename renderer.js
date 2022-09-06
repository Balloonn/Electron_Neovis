const dataForm = document.getElementById("dataForm");
dataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let quotationFile = document.getElementById("quotationFile");
    let formData= {} //ipc需要序列化，不能传递file，因此传路径由主进程加载文件
    if (quotationFile.files.length>0){
        formData['quotationFile']=quotationFile.files[0].path;
    }else{
        alert("请选择文件")
    }
    if (formData.hasOwnProperty('quotationFile')){
        window.api.send('startAnalysis',formData);
    }
});
var initStatus = false;
const mainContainer = document.getElementById("mainContainer");
const progressBar = document.getElementById("progressBar");
const startBtn = document.getElementById("startBtn");
const exportBtn = document.getElementById("exportBtn");
const logArea = document.getElementById("logArea")
// setInterval(window.api.send,1000,'getLog');//一直获取
window.api.receive('logValue',(arg)=>{
    logArea.value=arg;
    if (initStatus===false){
        initStatus = true;
    }
})
var getProcessInterval = null;
window.api.receive('analysisStatus', (arg) => {
    if (arg==='start'){ //开始信号
        startBtn.disabled = 'true';
        exportBtn.disabled = 'true';
        getProcessInterval = setInterval(window.api.send,1000,'getProgress');
    }else{ //异常退出
        startBtn.disabled = '';
        if (getProcessInterval!=null) {
            clearInterval(getProcessInterval); 
        }
    }
})
window.api.receive('progressValue', (arg) => {
    progressBar.ariaValueNow = arg;
    progressBar.style.width = arg+"%";
    progressBar.innerText = arg+"%";
    if (arg==100) {
        if (getProcessInterval!=null) {
            clearInterval(getProcessInterval);
        }
        exportBtn.disabled='';
        startBtn.disabled = '';
    }
})

exportBtn.addEventListener('click',(e)=>{
    window.api.send('exportResult')
})
