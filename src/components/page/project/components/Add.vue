<template>
    <div class="add">
        <el-dialog title="收货地址" :visible="true" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false">
            <el-form :model="form" label-width="auto">
                <el-form-item label="项目名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="项目图片">
                    <el-upload
                        class="avatar-uploader"
                        :show-file-list="false"
                        :on-success="handleAvatarSuccess"
                        :before-upload="beforeAvatarUpload"
                    >
                        <img v-if="form.imageUrl" :src="form.imageUrl" class="avatar" />
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                </el-form-item>
                <el-form-item label="项目状态">
                    <el-select v-model="form.status" placeholder="请选择">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"> </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="预交付日期">
                    <el-date-picker v-model="form.preDate" type="date" placeholder="选择日期"> </el-date-picker>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="handleClose">取 消</el-button>
                <el-button type="primary" @click="handleConfig">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    props: ['handleClose'],
    data() {
        return {
            form: {
                projectName: '',
                imageUrl: '',
                upgradeFilePath: '',
                status: '',
                preDate: ''
            },
            options: [
                {
                    label: '烂尾',
                    value: '1'
                },
                {
                    label: '停工',
                    value: '0'
                },
                {
                    label: '延期',
                    value: '1'
                },
                { label: '正常', value: '2' },
                { label: '超前', value: '3' }
            ]
        };
    },
    methods: {
        handleConfig() {
            const param = JSON.parse(JSON.stringify(this.form));
            this.blobToBase64(param.imageUrl).then((res) => {
                param.imageUrl = res;
                // 提交param
                this.handleClose();
            });
        },
        blobToBase64(blob) {
            return new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.onload = (e) => {
                    resolve(e.target.result);
                };
                fileReader.readAsDataURL(blob);
                fileReader.onerror = () => {
                    reject(new Error('blobToBase64 error'));
                };
            });
        },
        handleAvatarSuccess(res, file) {
            this.form.imageUrl = URL.createObjectURL(file.raw);
        },
        beforeAvatarUpload(file) {
            const isJPG = file.type === 'image/jpeg';
            const isJPNG = file.type === 'image/png';
            const isLt2M = file.size / 1024 / 1024 < 2;

            if (!(isJPG || isJPNG)) {
                this.$message.error('只能是 JPG和PNG 格式!');
            }
            if (!isLt2M) {
                this.$message.error('图片大小不能超过 2MB!');
            }
            return isJPG && isLt2M;
        }
    }
};
</script>
<style lang="less">
.add {
    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }
    .avatar-uploader .el-upload:hover {
        border-color: #409eff;
    }
    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 178px;
        height: 178px;
        line-height: 178px;
        text-align: center;
    }
    .avatar {
        width: 178px;
        height: 178px;
        display: block;
    }
}
</style>
