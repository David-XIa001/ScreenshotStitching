<template lang="">
    <div class="picture">
        <el-form ref="form" label-width="80px">
            <el-form-item label="上传图片">
                <el-upload
                    accept=".jpg, .png"
                    ref="upload"
                    action=""
                    :multiple="true"
                    :on-change="onUploadChange"
                    :auto-upload="false"
                    :on-remove="handleRemove"
                >
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">
                        <p>只能上传.png, .jpg,文件</p>
                        <p>每个图片的大小需一致</p>
                    </div>
                </el-upload>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :disabled="imgList.length == 0" @click="onPreview">预览</el-button>
            </el-form-item>
        </el-form>
        <el-dialog
            title="截取图片"
            :visible.sync="centerDialogVisible"
            :close-on-click-modal="false"
            :before-close="closeDialog"
            width="800px"
        >
            <div class="box">
                <div class="block">
                    <el-switch v-model="special" active-text="首图剪裁" inactive-text="首图不剪裁"> </el-switch>
                </div>
                <el-form label-width="80px">
                    <el-form-item label="截图高度">
                        <el-slider v-model="height" range :step="1" :min="0" :max="reallHeight"></el-slider>
                    </el-form-item>
                </el-form>
                <el-button type="primary" :disabled="imgListCopy.length == 0" @click="onStitch">拼接图片</el-button>
                <el-button type="primary" @click="downImg" :disabled="!stitchImg">下载拼接图片</el-button>
                <template v-for="(img, index) in imgListCopy">
                    <div class="img-box" :style="!special && index == 0 ? '' : `height: ${height[1] - height[0]}px`">
                        <el-image
                            ref="img"
                            :class="!special && index == 0 ? 'img1' : 'img'"
                            :style="!special && index == 0 ? '' : `top: ${height[1] - reallHeight}px`"
                            :src="imgListCopy[index]"
                        ></el-image>
                        <div class="operation">
                            <el-button type="danger" title="删除" @click="onDelete(index)" icon="el-icon-delete" circle></el-button>
                            <el-button
                                type="primary"
                                title="上移"
                                v-if="index !== 0"
                                @click="onMove(index, 'top')"
                                icon="el-icon-top"
                                circle
                            ></el-button>
                            <el-button
                                type="primary"
                                title="下移"
                                v-if="index !== imgListCopy.length - 1"
                                @click="onMove(index, 'bottom')"
                                icon="el-icon-bottom"
                                circle
                            ></el-button>
                        </div>
                    </div>
                </template>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            imgList: [],
            imgListCopy: [],
            uidList: [],
            centerDialogVisible: false,
            height: [0, 0],
            special: false,
            reallHeight: 0,
            imageHeight: 0,
            imageWidth: 0,
            stitchImg: ''
        };
    },
    methods: {
        onDelete(index) {
            this.imgListCopy.splice(index, 1);
        },
        onMove(index, type) {
            if (type === 'bottom') {
                let item = this.imageList[index];
                this.$set(this.imageList, index, this.imageList[index + 1]);
                this.$set(this.imageList, index + 1, item);
            } else {
                let item = this.imageList[index];
                this.$set(this.imageList, index, this.imageList[index - 1]);
                this.$set(this.imageList, index - 1, item);
            }
        },
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
        onStitch() {
            this.mergeImgs(this.imgListCopy).then((res) => {
                this.stitchImg = res;
            });
        },
        mergeImgs(list, cwith = this.imageWidth, cheight = parseInt(((this.height[1] - this.height[0]) * this.imageWidth) / 760)) {
            return new Promise((resolve, reject) => {
                // 创建 canvas 节点并初始化
                const canvas = document.createElement('canvas');
                canvas.width = cwith; //设置 canvas 的宽度
                canvas.height = !this.special ? this.imageHeight + cheight * (list.length - 1) : cheight * list.length; // 设置canvans 的高度
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
                            context.drawImage(img, 0, 0, cwith, this.imageHeight);
                        } else {
                            // 截取图片对应位置的画面
                            context.drawImage(
                                img,
                                0, // 开始剪切图片的 x 坐标位置
                                this.imageHeight - (this.height[1] * this.imageWidth) / 760, // 开始剪切图片的 y 坐标位置
                                cwith, // 被剪切图像的宽度
                                cheight, // 被剪切图像的高度
                                0, // 在画布上放置图像的 x 坐标位置
                                !this.special ? this.imageHeight + cheight * (index - 1) : cheight * index, // 在画布上放置图像的 y 坐标位置
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
        closeDialog() {
            this.centerDialogVisible = false;
        },
        onPreview() {
            this.imgListCopy = JSON.parse(JSON.stringify(this.imgList));
            this.centerDialogVisible = true;
            setTimeout(() => {
                const img = this.$refs.img;
                this.imageHeight = img[0].imageHeight;
                this.imageWidth = img[0].imageWidth;
                this.reallHeight = parseInt((760 / this.imageWidth) * this.imageHeight);
                this.height = [0, 100];
            }, 300);
        },
        onUploadChange(file, fileList) {
            this.imgList.push(URL.createObjectURL(file.raw));
            this.uidList.push(file.uid);
        },
        handleRemove(file, fileList) {
            const index = this.uidList.findIndex((item) => item === file.uid);
            this.uidList.splice(index, 1);
            this.imgList.splice(index, 1);
        }
    }
};
</script>
<style lang="less">
.picture {
    .box {
        .img-box {
            position: relative;
            overflow: hidden;
            .img {
                width: 100%;
                position: absolute;
            }
            .img1 {
                vertical-align: bottom;
                width: 100%;
                overflow: hidden;
            }
            .operation {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                width: 120px;
                .el-icon-bottom,
                .el-icon-top,
                .el-icon-delete {
                    font-size: 12px;
                    cursor: pointer;
                }
            }
        }
    }
}
</style>
