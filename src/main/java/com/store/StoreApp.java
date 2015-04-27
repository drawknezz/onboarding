package main.java.com.store;

import java.io.IOException;
import java.io.InputStream;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class StoreApp {
	public final static Logger logger = LogManager.getLogger(StoreApp.class.getName());
	
	@Bean
	public static SqlSessionFactory getSqlSessionFactory() throws IOException{
		String configFile = "";
//		configFile += "main/java/com/store/resources/";
		configFile += "mybatis-config.xml";
		InputStream config = Resources.getResourceAsStream(configFile);
		return new SqlSessionFactoryBuilder().build(config);
	}
	
	public static void main(String[] args) {
		SpringApplication.run(StoreApp.class, args);
	}

}
