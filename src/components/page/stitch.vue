<template>
    <div class="login-wrap">
        <div class="title">视频截图拼接小工具</div>
        <div class="container">
            <el-form ref="form" label-width="80px">
                <el-form-item label="上传视频">
                    <el-upload
                        accept=".mp4, .avi, .mov"
                        ref="upload"
                        action=""
                        :limit="1"
                        :on-exceed="onUploadExceed"
                        :on-change="onUploadChange"
                        :auto-upload="false"
                        :on-remove="handleRemove"
                    >
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传.mp4, .avi, .mov文件</div>
                    </el-upload>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" :disabled="!currentVideoUrl" @click="onPreview">预览</el-button>
                </el-form-item>
            </el-form>
        </div>
        <el-dialog title="截取图片" :visible.sync="centerDialogVisible" :close-on-click-modal="false" :before-close="closeDialog" width="50%">
            <div class="box">
                <video ref="currentVideo" muted="true" autoplay controls :src="currentVideoUrl" width="100%" />
                <div class="line" :style="'bottom:' + lineHeight + 'px'"></div>
            </div>
            <!-- <el-form ref="form" label-width="80px">
                <el-form-item label="开始时间">
                    <el-button type="primary" @click="getCurrentTime('startTime')">视频截图开始时间</el-button><span>{{ startTime }}</span>
                </el-form-item>
                <el-form-item label="结束时间">
                    <el-button type="primary" @click="getCurrentTime('endTime')">视频截图结束时间</el-button><span>{{ endTime }}</span>
                </el-form-item>
            </el-form> -->
            <el-button type="primary" @click="getImgBase64">截取视频当前画面</el-button>
            <div class="img-list" v-if="imageList">
                <template v-for="(item, index) in imageList">
                    <el-popover :key="index" placement="top-start" width="300" trigger="hover">
                        <div>
                            <el-image style="width: 300px" :src="imageList[index]" :fit="'cover'"></el-image>
                            <el-button type="danger" @click="onDelete(index)" icon="el-icon-delete" circle></el-button>
                        </div>
                        <el-image slot="reference" style="width: 100px" :src="imageList[index]" :fit="'cover'"></el-image>
                    </el-popover>
                </template>
            </div>
            <div class="block">
                <span class="demonstration">截图高度</span>
                <el-slider v-model="heigth" :step="1" :min="1" :max="videoHeight"></el-slider>
            </div>
            <el-button type="primary" :disabled="imageList.length == 0" @click="onStitch">拼接图片</el-button>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="downImg" :disabled="!stitchImg">下载拼接图片</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            formData: {},
            centerDialogVisible: false,
            currentVideoUrl: null,
            startTime: '',
            endTime: '',
            imageList: [],
            imageList1: [],
            videoWidth: '',
            videoHeight: 0,
            heigth: 0,
            videoReallHeight: 0,
            lineHeight: 0,
            stitchImg: ''
        };
    },
    watch: {
        heigth: function (newVal, oldVal) {
            this.lineHeight = (newVal / this.videoHeight) * this.videoReallHeight;
        }
    },
    methods: {
        downImg() {
            let a = document.createElement('a');
            a.download = 'stitch';
            a.style.display = 'none';
            a.setAttribute('download', 'stitch');
            a.href = this.stitchImg;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },
        onDelete(index) {
            this.imageList.splice(index, 1);
        },
        onStitch() {
            this.mergeImgs(this.imageList).then((res) => {
                this.stitchImg = res;
            });
        },
        // getCutImg(list) {
        //     return new Promise((resolve, reject) => {
        //         const canvas = document.createElement('canvas');
        //         canvas.width = this.videoWidth;
        //         canvas.height = this.heigth;
        //         let ctx = canvas.getContext('2d');
        //         list.map((item, index) => {
        //             const img = new Image();
        //             img.src = item;
        //             img.crossOrigin = 'Anonymous';
        //             img.onload = () => {
        //                 ctx.drawImage(
        //                     img,
        //                     0,
        //                     this.videoHeight - this.heigth,
        //                     this.videoWidth,
        //                     this.heigth,
        //                     0,
        //                     0,
        //                     this.videoWidth,
        //                     this.heigth
        //                 );
        //                 let img1 = canvas.toDataURL('image/jpeg');
        //                 this.imageList1.push(img1);
        //                 if (this.imageList1[list.length - 1]) {
        //                     resolve();
        //                 }
        //             };
        //         });
        //     });
        // },
        mergeImgs(list, cwith = this.videoWidth, cheight = this.heigth) {
            return new Promise((resolve, reject) => {
                // 创建 canvas 节点并初始化
                const canvas = document.createElement('canvas');
                canvas.width = cwith;
                canvas.height = cheight * list.length;
                const context = canvas.getContext('2d');
                list.map((item, index) => {
                    const img = new Image();
                    img.src = item;
                    // 跨域
                    img.crossOrigin = 'Anonymous';
                    img.onload = () => {
                        context.drawImage(
                            img,
                            0,
                            this.videoHeight - this.heigth,
                            this.videoWidth,
                            this.heigth,
                            0,
                            this.heigth * index,
                            this.videoWidth,
                            this.heigth
                        );
                        if (index === list.length - 1) {
                            resolve(canvas.toDataURL('image/png'));
                        }
                    };
                });
            });
        },
        getImgBase64() {
            const video = this.$refs.currentVideo;
            const canvas = document.createElement('canvas');
            canvas.width = this.videoWidth;
            canvas.height = this.videoHeight;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            let img = canvas.toDataURL('image/jpeg');
            this.imageList.push(img);
        },
        // getCurrentTime(type) {
        //     if (type == 'startTime') {
        //         this.startTime = this.$refs.currentVideo.currentTime;
        //     } else {
        //         this.endTime = this.$refs.currentVideo.currentTime;
        //     }
        // },
        onPreview() {
            this.centerDialogVisible = true;
            setTimeout(() => {
                const video = this.$refs.currentVideo;
                this.videoWidth = video.videoWidth;
                this.videoHeight = video.videoHeight;
                this.heigth = 200;
                this.videoReallHeight = video.clientHeight;
            }, 500);
        },
        closeDialog(){
            this.centerDialogVisible = false;
            this.imageList = [];
            this.videoWidth = ''
            this.videoHeight = 0;
            this.heigth = 0;
            this.videoReallHeight = 0;
            this.lineHeight = 0;
            this.stitchImg = ''
        },
        onUploadChange(file, fileList) {
            const flieArr = file.name.split('.');
            const suffix = flieArr[flieArr.length - 1];

            this.currentVideoUrl = URL.createObjectURL(file.raw);
            this.formData = null;
            this.formData = new FormData();
            this.formData.append('fileSize', file.size);
            this.formData.append('firmwareFile', file.raw);
        },
        onUploadExceed(files, fileList, index) {
            fileList[0].name = files[0].name;
            fileList[0].raw = files[0];
            this.onUploadChange(fileList[0]);
        },
        handleRemove() {
            this.currentVideoUrl = null;
        }
    }
};
</script>

<style lang="less">
.login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-size: 100%;
    overflow: hidden;
    .title {
        margin: 50px;
        font-size: 32px;
        color: white;
    }
    .container {
        width: 600px;
        margin: 0 auto;
        .el-upload--text {
            text-align: left;
            width: 100%;
            height: 100%;
            border: none;
        }
    }
    .img-list {
        margin: 20px 0;
    }
    .box {
        position: relative;
    }
    .line {
        height: 1px;
        width: 100%;
        background-color: rgba(255, 0, 0, 0.842);
        position: absolute;
        bottom: 100px;
        z-index: 99;
    }
}
</style>
