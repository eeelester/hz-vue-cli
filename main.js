#!/usr/bin/env node
// --这种用法是为了防止操作系统用户没有将node装在默认的/usr/bin路径里。当系统看到这一行的时候，
// 首先会到env设置里查找node的安装路径，再调用对应路径下的解释器程序完成操作。
const { program } = require("commander");
const download = require("download-git-repo");
const inquirer = require("inquirer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require('path');
const ora = require("ora");
const chalk = require("chalk");
const symbols = require("log-symbols");
program
  .version("0.0.1", "-v, --version")
  .helpOption('-h,-hepl,--HELP')
  .option('init projectname', '生成一个vue项目')
  .command("init <name>")
  .description("生成一个vue项目")
  .action(name => {
    if (fs.existsSync(name)) {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red("项目已存在"));
      return;
    }
    inquirer
      .prompt([
        {
          name: "description",
          message: "请输入项目描述"
        },
        {
          name: "author",
          message: "请输入作者名称"
        }
      ])
      .then(answers => {
        const targetPath = path.resolve(process.cwd(),name);
        const spinner = ora("正在下载模板...");
        spinner.start();
        download(
          "direct:https://github.com/eeelester/hz-vue-template.git",
          targetPath,
          { clone: true },
          err => {
            if (!err) {
              spinner.succeed();
              const meta = {
                name,
                description: answers.description,
                author: answers.author
              };
              const packagePath = path.join(targetPath,'package.json');
              if (fs.existsSync(packagePath)) {
                const content = fs.readFileSync(packagePath).toString();
                const result = handlebars.compile(content)(meta);
                fs.writeFileSync(packagePath, result);
              }else{
                spinner.fail();
                console.log(chalk.red("failed! 没有package.json"));
                return
              }
              console.log(symbols.success, chalk.green("项目初始化完成"));
              console.log(
                chalk.greenBright("开启项目") + '\n' +
                chalk.greenBright("cd " + name) + '\n' + 
                chalk.greenBright("npm install") + '\n' + 
                chalk.greenBright("npm run dev"));
            } else {
              spinner.fail();
              console.log(symbols.error, chalk.red(`拉取远程仓库失败${err}`));
            }
          }
        );
      }).catch(err=>{
        console.log(chalk.red(err));
      })
  });
//解析命令行
program.parse(process.argv);

