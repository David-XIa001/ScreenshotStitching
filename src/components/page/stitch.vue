<template>
    <div class="login-wrap">
        <div class="title">视频截图拼接小工具</div>
        <div class="container">
            <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
                <el-tab-pane label="图片截图" name="picture"> <Picture /> </el-tab-pane>
                <el-tab-pane label="视频截图" name="video">
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
                    <el-dialog
                        title="截取图片"
                        :visible.sync="centerDialogVisible"
                        :close-on-click-modal="false"
                        :before-close="closeDialog"
                        width="50%"
                    >
                        <div class="box">
                            <video ref="currentVideo" muted="true" autoplay controls :src="currentVideoUrl" width="100%" />
                            <div class="line" :style="'bottom:' + lineHeight1 + 'px'"></div>
                            <div class="line" :style="'bottom:' + lineHeight0 + 'px'"></div>
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
                                        <el-button
                                            type="danger"
                                            title="删除"
                                            @click="onDelete(index)"
                                            icon="el-icon-delete"
                                            circle
                                        ></el-button>
                                        <el-button
                                            type="primary"
                                            title="左移"
                                            v-if="index !== 0"
                                            @click="onMove(index, 'left')"
                                            icon="el-icon-back"
                                            circle
                                        ></el-button>
                                        <el-button
                                            type="primary"
                                            title="右移"
                                            v-if="index !== imageList.length - 1"
                                            @click="onMove(index, 'right')"
                                            icon="el-icon-right"
                                            circle
                                        ></el-button>
                                    </div>
                                    <el-image slot="reference" style="width: 100px" :src="imageList[index]" :fit="'cover'"></el-image>
                                </el-popover>
                            </template>
                        </div>
                        <div class="block">
                            <span class="demonstration">截图高度</span>
                            <el-slider v-model="heigth" :step="1" range :min="0" :max="videoHeight"></el-slider>
                        </div>
                        <div class="block">
                            <el-switch v-model="special" active-text="首图剪裁" inactive-text="首图不剪裁"> </el-switch>
                        </div>
                        <el-button type="primary" :disabled="imageList.length == 0" @click="onStitch">拼接图片</el-button>
                        <span slot="footer" class="dialog-footer">
                            <el-button type="primary" @click="downImg" :disabled="!stitchImg">下载拼接图片</el-button>
                        </span>
                    </el-dialog>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
import Picture from './picture.vue';

export default {
    components: { Picture },
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
            heigth: [0, 0],
            videoReallHeight: 0,
            stitchImg: '',
            special: false,
            activeName: 'picture'
        };
    },
    watch: {
        heigth: function (newVal, oldVal) {
            this.lineHeight0 = (newVal[0] / this.videoHeight) * this.videoReallHeight;
            this.lineHeight1 = (newVal[1] / this.videoHeight) * this.videoReallHeight;
        }
    },
    computed: {
        lineHeight0() {
            return (this.heigth[0] / this.videoHeight) * this.videoReallHeight;
        },
        lineHeight1() {
            return (this.heigth[1] / this.videoHeight) * this.videoReallHeight;
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
        onMove(index, type) {
            if (type === 'right') {
                let item = this.imageList[index];
                this.$set(this.imageList, index, this.imageList[index + 1]);
                this.$set(this.imageList, index + 1, item);
            } else {
                let item = this.imageList[index];
                this.$set(this.imageList, index, this.imageList[index - 1]);
                this.$set(this.imageList, index - 1, item);
            }
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
        mergeImgs(list, cwith = this.videoWidth, cheight = this.heigth[1] - this.heigth[0]) {
            return new Promise((resolve, reject) => {
                // 创建 canvas 节点并初始化
                const canvas = document.createElement('canvas');
                canvas.width = cwith; //设置 canvas 的宽度
                canvas.height = !this.special ? this.videoHeight + cheight * (list.length - 1) : cheight * list.length; // 设置canvans 的高度
                const context = canvas.getContext('2d');
                list.map((item, index) => {
                    // 循环每张图片资源
                    const img = new Image();
                    img.src = item;
                    // 跨域
                    img.crossOrigin = 'Anonymous';
                    img.onload = () => {
                        if (!this.special && index == 0) {
                            // 截取整张图片
                            context.drawImage(img, 0, 0, cwith, this.videoHeight);
                        } else {
                            // 截取图片对应位置的画面
                            context.drawImage(
                                img,
                                0, // 开始剪切图片的 x 坐标位置
                                this.videoHeight - this.heigth[1], // 开始剪切图片的 y 坐标位置
                                cwith, // 被剪切图像的宽度
                                cheight, // 被剪切图像的高度
                                0, // 在画布上放置图像的 x 坐标位置
                                !this.special ? this.videoHeight + cheight * (index - 1) : cheight * index, // 在画布上放置图像的 y 坐标位置
                                cwith, // 被剪裁图像的宽度
                                cheight // 被剪裁图像的高度
                            );
                        }
                        if (index === list.length - 1) {
                            resolve(canvas.toDataURL('image/png')); // canvas上所有图片绘制完成后返回生成的图片
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
            let img = canvas.toDataURL('image/png');
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
                this.heigth = [0, 200];
                this.videoReallHeight = video.clientHeight;
            }, 500);
        },
        closeDialog() {
            this.centerDialogVisible = false;
            this.imageList = [];
            this.videoWidth = '';
            this.videoHeight = 0;
            this.heigth = [0, 0];
            this.videoReallHeight = 0;
            this.lineHeight0 = 0;
            this.lineHeight1 = 0;
            this.stitchImg = '';
            this.special = false;
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
