using MySql.Data.MySqlClient;
using System;
class Program {
    static void Main() {
        var conn = new MySqlConnection("Server=localhost;Database=traxonet_db;User=root;Password=Uriel@2007;");
        conn.Open();
        new MySqlCommand("ALTER TABLE computers MODIFY machine_name VARCHAR(512), MODIFY cpu VARCHAR(512), MODIFY gpu VARCHAR(512), MODIFY ip_address VARCHAR(255), MODIFY mac_address VARCHAR(255), MODIFY motherboard VARCHAR(512), MODIFY gpu_driver VARCHAR(512);", conn).ExecuteNonQuery();
        Console.WriteLine("Database schema modified successfully.");
    }
}
