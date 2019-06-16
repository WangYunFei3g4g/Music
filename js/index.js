(function () {
    //模拟数据

    //页面刚加载读取本地存储的歌曲列表
    let data = localStorage.getItem('mList') ?/*读到的值是个字符串，需要转换成json对象 */
        JSON.parse(localStorage.getItem('mList')) : [];

    let searhDate = [];

    //获取元素
    let start = document.querySelector('.start');
    let audio = document.querySelector('audio');
    let songSinger = document.querySelector('.ctrl-bars-box span');
    let logoImg = document.querySelector('.logo img');
    let liBox = document.querySelector('.play-list-box ul');
    let next = document.querySelector('.next');
    let prev = document.querySelector('.prev');
    let nowTimeSpan = document.querySelector('.nowTime');
    let totalTimeSpan = document.querySelector('.totalTime');
    let ctrlBars = document.querySelector('.ctrl-bars');
    let nowBars = document.querySelector('.nowBars');
    let ctrlbtn = document.querySelector('.ctrl-btn');
    let modeBtn = document.querySelector('.mode');
    let infoMode = document.querySelector('.info');
    let body = document.querySelector('body');
    let ran = document.querySelector('#ran');
    let voice = document.querySelector('.voice');
    // let small = document.querySelector('.ctrl-btn-small');


    //变量
    let index = 0;/*当前播放的第几首歌*/
    let ranNum = 0;
    let rotateDeg = 0;/*logo转圈的角度*/
    let timer = null;/*定时器的名字*/
    let modeNum = 0;//0 顺序播放 1 单曲循环 2 随机播放
    let playList = null;//在后面获取播放列表中的li标签


    function loadPlayList() {
        if (data.length) {//如果为0，会是false，不进
            let str = '';/*播放列表*/
            //加载播放列表
            for (let i = 0; i < data.length; i++) {
                str += '<li>';
                str += '<i>❌</i>';
                str += '<span>' + data[i].name + '</span>';
                str += '<span>';
                for (let j = 0; j < data[i].ar.length; j++) {
                    str += data[i].ar[j].name + '  ';
                }
                str += '</span>';

                str += '</li>';
            }
            liBox.innerHTML = str;
        }
    }

    loadPlayList();


    //播放列表换歌

    $(liBox).on('click', 'li', function () {
        index = $(this).index();
        init();
        play();
    });

    //播放列表上的数目
    function loadNum() {
        $(".play-list").html(data.length);
    }


    //请求服务器
    $('.search').on('keydown', function (e) {
        if (e.keyCode == 13) {
            //服务器地址
            $.ajax({
                url: 'https://api.imjad.cn/cloudmusic/',
                //参数
                data: {
                    type: 'search',
                    s: this.value
                },
                success: function (data) {

                    console.log(data.result.songs);
                    var str = '';
                    searhDate = data.result.songs;
                    if (searhDate == null) {
                        $('.searchUl').css('display', 'none');
                    } else {
                        $('.searchUl').css('display', 'block');
                    }
                    for (let i = 0; i < searhDate.length; i++) {
                        str += '<li>';
                        str += '<span class="left song">' + searhDate[i].name + '</span>';
                        str += '<span class="right singer">';
                        for (let j = 0; j < searhDate[i].ar.length; j++) {
                            str += searhDate[i].ar[j].name + '  ';
                        }
                        str += ' </span>';
                        str += '</li>';
                    }
                    $('.searchUl').html(str);
                },
                error: function (err) {
                    console.log(err);
                }
            });
            this.placeholder = this.value;

            this.value = '';

            // $("input").blur(function () {
            //     $("input").css("background-color", "#D6D6FF");
            // });
        }
    });

    $('.searchUl').on('click', 'li', function () {
        data.push(searhDate[$(this).index()]);//点的第几首歌并且放到data里面
        localStorage.setItem('mList', JSON.stringify(data));/*推送到本地存储里面去，设置本地储存，必须转换成字符串*/
        loadPlayList();
        loadNum();
        index = data.length - 1;
        let paused = audio.paused;
        init();
        play();
    });

    //切换播放列表
    function clickPlayList() {
        //获取前面添加的li标签
        playList = document.querySelectorAll('.play-list-box ul li');
        //先把全部li标签的样式清理掉，随后再加上
        for (let i = 0; i < playList.length; i++) {
            playList[i].className = '';
        }
        playList[index].className = 'active';
    }

    init();

    //初始化播放
    function init() {
        // 给audio设置播放路径
        audio.src = 'http://music.163.com/song/media/outer/url?id=' + data[index].id + '.mp3';
        loadNum();
        rotateDeg = 0;
        clickPlayList();
        setvalue();
        Voice();
        let str = '';
        str += data[index].name + ' --- '
        for (let i = 0; i < data[index].ar.length; i++) {
            str += data[index].ar[i].name + '  ';
        }
        songSinger.innerHTML = str;
        logoImg.src = data[index].al.picUrl;
    }

    //播放音乐
    function play() {
        clearInterval(timer);
        audio.play();
        start.style.backgroundPositionY = '-159px'
        timer = setInterval(function () {
            rotateDeg++;
            logoImg.style.transform = 'rotate(' + rotateDeg + 'deg)'
        }, 30)
    }

    //暂停播放
    function pause() {
        audio.pause();
        clearInterval(timer);
        start.style.backgroundPositionY = '-198px'
    }


    //播放和暂停
    start.addEventListener('click', function () {
        //监测歌曲是播放状态还是暂停状态
        if (audio.paused) {
            play();
        } else {
            pause();
        }
    });


    //空格播放事件
    $(document).keypress(function (e) {
        if (e.keyCode == 32 /*| e.keyCode == 13*/) {
            if (audio.paused) {
                play();
            } else {
                pause();
            }
        }
    });

//下一曲
    next.addEventListener('click', function () {
        index++;
        console.log(index);
        index = index > data.length - 1 ? 0 : index;
        // let paused = audio.paused;
        init();
        // if (paused == false) {
        play();
        // }

    })
//上一曲
    prev.addEventListener('click', function () {
        index--;
        index = index < 0 ? data.length - 1 : index;
        let paused = audio.paused;
        init();
        if (paused == false) {
            play();
        }
    })

    //时间格式
    function formatTime(time) {
        time = time > 9 ? time : '0' + time;
        return time;
    }

    //进度条
    audio.addEventListener('canplay', function () {//当音乐没有加载完的时候，是不可以获取到总时间的，所以canplay的意思是，可以播放，也就是加载完了的时候
        //总时间
        let totalTime = audio.duration;
        let TotaM = parseInt(totalTime / 60);
        let TotaS = parseInt(totalTime % 60);
        totalTimeSpan.innerHTML = formatTime(TotaM) + ':' + formatTime(TotaS);

        //现在的时间
        audio.addEventListener('timeupdate', function () {
            let currentTime = audio.currentTime;
            let TotaM = parseInt(currentTime / 60);
            let TotaS = parseInt(currentTime % 60);
            nowTimeSpan.innerHTML = formatTime(TotaM) + ':' + formatTime(TotaS);
            //小圆
            let barWidth = ctrlBars.clientWidth;
            let position = currentTime / totalTime * barWidth;
            nowBars.style.width = position + 'px';
            ctrlbtn.style.left = position + 'px';

            //歌曲结束
            if (audio.ended) {
                console.log(modeNum);
                switch (modeNum) {
                    case 0:
                        //顺序播放
                        next.click();
                        break;
                    case 1:
                        //单曲播放
                        // start.click();
                        init();
                        play();
                        break;
                    case 2:
                        //随机播放
                        index = getRunableNum();
                        init();
                        play();
                        break;
                }
            }
            // small.style.left = position + 'px';
        });


        //取不重复的随机数
        function getRunableNum() {
            let number = Math.floor(Math.random() * data.length);
            if (index == number) {
                number = getRunableNum()
            }
            return number;
        }

        //进度条点击事件
        ctrlBars.addEventListener('click', function (e) {
            audio.currentTime = e.offsetX / ctrlBars.clientWidth * audio.duration;
        });
        //键盘快进时间
        $(document.body).unbind('keydown');//移除之前的键盘事件
        $(document.body).keydown(function (e) {
                console.log(e.keyCode + "Ascii码");
                if (e.keyCode === 37) {
                    console.log(ranNum + 'a');
                    audio.currentTime -= audio.duration * 0.05;
                    console.log(ranNum + 'b');
                } else if (e.keyCode === 39) {
                    audio.currentTime += audio.duration * 0.05;
                }
                ;

                if (e.keyCode === 38) {
                    ranNum += 10;
                    ranNum = ranNum > 100 ? 100 : ranNum;
                    ran.value = ranNum;
                    audio.volume = ran.value / 100;
                    audio.muted = false;
                    Voice();
                } else if (e.keyCode === 40) {
                    ranNum -= 10;
                    ranNum = ranNum < 0 ? 0 : ranNum;
                    ran.value = ranNum;
                    audio.volume = ran.value / 100;
                    audio.muted = false;
                    Voice();
                }
                ;

            }
        );

    });

    //拖动range进行调音量大小
    function setvalue() {
        console.log(ranNum + 'e');
        ranNum = parseInt(ran.value);
        console.log(ranNum + 'c');
        audio.volume = ranNum / 100;
        audio.muted = false;
        Voice();
    }


    $(ran).on('change', function () {
        console.log(ranNum + 'd');
        setvalue();
    });

    //模式点击事件
    function info(modeStr) {
        // infoMode.style.display = 'block';
        $(infoMode).fadeIn();
        infoMode.innerHTML = modeStr;
        setTimeout(function () {
            $(infoMode).fadeOut();
        }, 1000)
    }

//    模式选择
    modeBtn.addEventListener('click', function () {
        modeNum++;
        modeNum = modeNum > 2 ? 0 : modeNum;
        console.log(modeNum);
        switch (modeNum) {
            case 0:
                info('循环播放');
                modeBtn.style.backgroundPositionX = '0px';
                modeBtn.style.backgroundPositionY = '-336px';
                break;
            case 1:
                info('单曲播放');
                modeBtn.style.backgroundPositionX = '-65px';
                modeBtn.style.backgroundPositionY = '-336px';
                break;
            case 2:
                info('随机播放');
                modeBtn.style.backgroundPositionX = '-65px';
                modeBtn.style.backgroundPositionY = '-241px';
                break;
        }
    });
    //模式移入事件
    modeBtn.addEventListener('mouseenter', function () {
        switch (modeNum) {
            case 0:
                modeBtn.style.backgroundPositionX = '-30px';
                modeBtn.style.backgroundPositionY = '-336px';
                break;
            case 1:
                modeBtn.style.backgroundPositionX = '-92px';
                modeBtn.style.backgroundPositionY = '-336px';
                break;
            case 2:
                modeBtn.style.backgroundPositionX = '-92px';
                modeBtn.style.backgroundPositionY = '-241px';
                break;
        }
    });
    //模式移出事件
    modeBtn.addEventListener('mouseleave', function () {
        switch (modeNum) {
            case 0:
                modeBtn.style.backgroundPositionX = '0px';
                modeBtn.style.backgroundPositionY = '-336px';
                break;
            case 1:
                modeBtn.style.backgroundPositionX = '-65px';
                modeBtn.style.backgroundPositionY = '-336px';
                break;
            case 2:
                modeBtn.style.backgroundPositionX = '-65px';
                modeBtn.style.backgroundPositionY = '-241px';
                break;
        }
    })

//    播放列表删除事件
    $(liBox).on('click', 'i', function (e) {
        data.splice($(this).parent().index(), 1);
        localStorage.setItem('mList', JSON.stringify(data));
        loadPlayList();
        loadNum();
        e.stopPropagation();
    });


//音量显示
    $('.voice').on('click', function () {
        $('#ran').fadeIn();
        setTimeout(function () {
            $('#ran').fadeOut();
        }, 2000);
    })

    function Voice() {
        if (ranNum > 30) {
            voice.style.backgroundPositionX = '0px';
            voice.style.backgroundPositionY = '-240px';
        } else {
            voice.style.backgroundPositionX = '-102px';
            voice.style.backgroundPositionY = '-60px';
        }
    }

    voice.addEventListener('mouseenter', function () {
        if (ranNum > 30) {
            voice.style.backgroundPositionX = '-29px';
            voice.style.backgroundPositionY = '-240px';
        } else {
            voice.style.backgroundPositionX = '-126px';
            voice.style.backgroundPositionY = '-60px';
        }
    });
    voice.addEventListener('mouseleave', function () {
        Voice();
    });


})
();
