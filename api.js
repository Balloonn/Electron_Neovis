const { ipcMain, dialog } = require("electron")

const fetch = require('electron-fetch').default
var FormData = require('form-data');
var fs = require('fs');
function startAnalysis(args) {
    var formData = new FormData();
    if (args.hasOwnProperty('quotationFile')) {
        formData.append('quotationFile', fs.createReadStream(args["quotationFile"]));
    }
    return fetch('http://localhost:5000/start', {
        method: 'POST',
        body: formData,
    })
}

ipcMain.on('startAnalysis', (event, args) => {
    startAnalysis(args).then(response => {
        if (response.ok) {
            event.reply('analysisStatus', 'start');
        } else {
            event.reply('analysisStatus', 'stop');
        }
    }).catch(error => {
        console.log(error);
        event.reply('analysisStatus', 'stop');
    })
})

ipcMain.on('getProgress', (event, args) => {
    fetch('http://localhost:5000/progress', {
        method: 'GET'
    }).then(response => {
        if (response.ok) {
            return response.text()
        } else {
            event.reply('analysisStatus', 'stop');
        }
    })
        .then(value => {
            event.reply('progressValue', value);
        })
        .catch(error => {
            console.log(error);
            event.reply('analysisStatus', 'stop');
        })
})


ipcMain.on('getLog', (event, args) => {
    fetch('http://localhost:5000/log', {
        method: 'GET'
    }).then(response => {
        if (response.ok) {
            return response.text();
        }
    }).then(value => {
        event.reply('logValue', value)
    }).catch(error=>{
        console.log(error);
    })
})

ipcMain.on('exportResult', (event, args) => {
    fetch('http://localhost:5000/result', {
        method: 'GET'
    }).then(response => {
        if (response.ok) {
            return response.buffer();
        }
    }).then(value => {
        dialog.showSaveDialog({
            title: "保存结果",
            buttonLabel: "保存",
            defaultPath: res_filename,
            filters: [
                {name: 'Document', extensions: ['xlsx', 'xls']}
            ]
        }).then(result => {
            if (!result.canceled) fs.writeFileSync(result.filePath, value);
        }).catch(err => {
            console.log(err)
        })
    })

})