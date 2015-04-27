package main.java.com.store.controller;

import java.util.List;

import main.java.com.store.dto.ProductDTO;
import main.java.com.store.service.ProductsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ViewInventory {
	
	@Autowired
	ProductsService service;
	
	@RequestMapping("/inventory")
	public String viewInventory(@RequestParam(value="name", required=false, defaultValue="World") String name, Model model){
		
		model.addAttribute("products", "kjf");
		
		return "inventory";
	}
}
