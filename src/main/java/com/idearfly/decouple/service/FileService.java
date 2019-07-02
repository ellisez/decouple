package com.idearfly.decouple.service;

import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.util.IOUtils;
import com.idearfly.decouple.vo.FileObject;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileService {
    private static final String FileDirectory = "/files";

    public String filePath(HttpServletRequest request) {
        String path = request.getServletPath().replaceAll("^/manager", FileDirectory);
        return request.getServletContext().getRealPath(path);
    }

    public String readContent(HttpServletRequest request) {
        String path = filePath(request);
        FileInputStream fileInputStream = null;
        BufferedReader reader = null;
        String laststr = null;
        try{
            fileInputStream = new FileInputStream(path);
            InputStreamReader inputStreamReader = new InputStreamReader(fileInputStream, "UTF-8");
            reader = new BufferedReader(inputStreamReader);
            String tempString = null;
            while((tempString = reader.readLine()) != null){
                laststr += tempString;
            }
            reader.close();
        }catch(IOException e){
            e.printStackTrace();
        }finally{
            if(fileInputStream != null) {
                try {
                  fileInputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
            if(reader != null){
                try {
                    reader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return laststr;
    }

    public String writeContent(HttpServletRequest request, String text) {
        String path = filePath(request);
        File file = new File(path);
        mkdirs(file);

        FileWriter writer = null;
        try {
            writer = new FileWriter(file);
            writer.write(text);
            writer.flush();
            writer.close();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (writer != null) {
                try {
                    writer.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return null;
    }

    public JSONObject readJSONObject(HttpServletRequest request) {
        String path = filePath(request);
        FileInputStream fileInputStream = null;
        try {
            fileInputStream = new FileInputStream(path);
            JSONObject jsonObject = JSONObject.parseObject(
                    fileInputStream,
                    IOUtils.UTF8,
                    JSONObject.class);
            return jsonObject;
        } catch (IOException e) {
            //e.printStackTrace();
        } finally{
            if(fileInputStream != null) {
                try {
                    fileInputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return null;

    }

    public void writeJSONObject(HttpServletRequest request, JSONObject jsonObject) {
        String path = filePath(request);
        File file = new File(path);
        mkdirs(file);

        FileOutputStream fileOutputStream = null;
        try {
            fileOutputStream = new FileOutputStream(file);
            JSONObject.writeJSONString(
                    fileOutputStream,
                    jsonObject);
        } catch (IOException e) {
            //e.printStackTrace();
        } finally{
            if(fileOutputStream != null) {
                try {
                    fileOutputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public List<FileObject> listFiles(HttpServletRequest request) {
        String path = filePath(request);
        File file = new File(path);
        if (!file.isDirectory()) {
            return null;
        }
        File[] files = file.listFiles();
        List<FileObject> list = new ArrayList<>(files.length);
        for (File f: files) {
            FileObject fileObject = new FileObject();
            fileObject.setName(f.getName());
            fileObject.setPath(f.getPath());
            fileObject.setType(f.isFile());
            list.add(fileObject);
        }
        return list;
    }

    public Boolean deleteJSONObject(HttpServletRequest request) {
        String path = filePath(request);
        File file = new File(path);
        if (file.exists()) {
            return file.delete();
        }
        return false;
    }

    private void mkdirs(File file) {
        File parentFile = file.getParentFile();
        if (!parentFile.exists()) {
            parentFile.mkdirs();
        }
    }
}
