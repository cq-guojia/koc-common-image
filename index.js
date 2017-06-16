const KOCReturn = require("koc-common-return");
const ImageMagick = require("gm").subClass({imageMagick: true});

const KOCImage = {
  Ratio: (Path) => {
    return new Promise((resolve) => {
      ImageMagick(Path).size((err, value) => {
        const retValue = KOCReturn.Value();
        if (err) {
          retValue.hasError = true;
          retValue.message = err.message;
          retValue.returnObject = err;
          return resolve(retValue);
        }
        retValue.returnObject = value.width / value.height;
        retValue.PutValue("Width", value.width);
        retValue.PutValue("Height", value.height);
        resolve(retValue);
      });
    });
  },
  Resize: (mode, source, target, width, height) => {
    return new Promise((resolve) => {
      const retValue = KOCReturn.Value();
      let Image = ImageMagick(source);
      if (!Image) {
        retValue.hasError = true;
        retValue.message = "没有找到图片文件";
        return resolve(retValue);
      }
      height = (height && height > 0) ? height : null;
      Image.size((err, value) => {
        if (err) {
          retValue.hasError = true;
          retValue.message = err.message;
          return resolve(retValue);
        }
        let x = 0, y = 0, ow = value.width, oh = value.height, tw = width, th = height;
        const Ratio = {
          Width: value.width,
          Height: value.height,
          Original: value.width / value.height,
          This: -1
        };
        switch (mode) {
          case "W"://固定宽
          case "H"://固定高
          case "W_H"://最大宽,最大高(比例)
            Image.resize(tw, th);
            Ratio.This = tw / th;
            break;
          default://固定宽,固定高
            Image.resize(tw, th, "!");
            Ratio.This = tw / th;
            break;
          case "Cut_Middle"://裁剪(中)(按比例放大or缩小)
            if (!width || !height) {
              Image.resize(tw, th);
              Ratio.This = tw / th;
              break;
            }
            th = oh * tw / ow;
            if (height > th) {
              tw = tw * height / th;
              th = height;
            }
            Image = Image.resize(tw, th).crop(width, height, (tw - width) / 2, (th - height) / 2);
            Ratio.This = width / height;
            break;
          case "Cut_Top"://裁剪(顶)(按比例放大or缩小)
            if (!width || !height) {
              Image.resize(tw, th);
              Ratio.This = tw / th;
              break;
            }
            th = oh * tw / ow;
            if (height > th) {
              tw = tw * height / th;
              th = height;
            }
            Image = Image.resize(tw, th).crop(width, height, (tw - width) / 2, 0);
            Ratio.This = width / height;
            break;
          case "Cut_Bottom"://裁剪(顶)(按比例放大or缩小)
            if (!width || !height) {
              Image.resize(tw, th);
              Ratio.This = tw / th;
              break;
            }
            th = oh * tw / ow;
            if (height > th) {
              tw = tw * height / th;
              th = height;
            }
            Image = Image.resize(tw, th).crop(width, height, (tw - width) / 2, th - height);
            Ratio.This = width / height;
            break;
          case "W_HMaxCut"://固定宽，最大高裁剪(顶)
            if (!height) {
              Image.resize(tw, th);
              Ratio.This = tw / th;
              break;
            }
            th = oh * width / ow;
            Image = Image.resize(tw, th);
            Ratio.This = tw / th;
            if (th > height) {
              Image = Image.crop(tw, height, x, y);
              Ratio.This = tw / height;
            }
            break;
          case "W_HMaxCut_Middle"://固定宽，最大高裁剪(中)
            if (!height) {
              Image.resize(tw, th);
              Ratio.This = tw / th;
              break;
            }
            th = oh * width / ow;
            Image = Image.resize(tw, th);
            Ratio.This = tw / th;
            if (th > height) {
              y = (th - height) / 2;
              Image = Image.crop(tw, height, x, y);
              Ratio.This = tw / height;
            }
            break;
          case "H_WMaxCut"://固定高，最大宽裁剪(顶)
            if (!width) {
              Image.resize(tw, th);
              Ratio.This = tw / th;
              break;
            }
            tw = ow * height / oh;
            Image = Image.resize(tw, th);
            Ratio.This = tw / th;
            if (tw > width) {
              Image = Image.crop(width, th, x, y);
              Ratio.This = width / th;
            }
            break;
          case "H_WMaxCut_Middle"://固定高，最大宽裁剪(顶)
            if (!width) {
              Image.resize(tw, th);
              Ratio.This = tw / th;
              break;
            }
            tw = ow * height / oh;
            Image = Image.resize(tw, th);
            Ratio.This = tw / th;
            if (tw > width) {
              x = (tw - width) / 2;
              Image = Image.crop(width, th, x, y);
              Ratio.This = width / th;
            }
            break;
        }
        Image.write(target, (err) => {
          if (err) {
            retValue.hasError = true;
            retValue.message = err.message;
            return resolve(retValue);
          }
          retValue.returnObject = Ratio;
          resolve(retValue);
        });
      });
    });
  }
};

module.exports = KOCImage;