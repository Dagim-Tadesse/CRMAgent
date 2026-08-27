using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRMAgent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadAssignedTo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AssignedTo",
                table: "Leads",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedTo",
                table: "Leads");
        }
    }
}
